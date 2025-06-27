import { supabase } from './supabase'
import { CHECKLIST_SECTIONS, getChecklistItem } from '@/data/checklist-items'

interface ChecklistData {
  car: {
    registration_number: string
    make?: string
    model?: string
    year?: number
  }
  sections: {
    section: string
    title: string
    items: {
      item_key: string
      status: string | null
      comment?: string
      created_by: string
      updated_at: string
    }[]
  }[]
  media: {
    id: string
    file_path: string
    file_type: string
    checklist_item_id?: string
  }[]
}

export async function generateChecklistPDF(carId: string): Promise<Blob> {
  // First, gather all the data
  const checklistData = await gatherChecklistData(carId)
  
  // Generate HTML content
  const htmlContent = generateHTMLContent(checklistData)
  
  // Create HTML blob that can be opened in browser and printed as PDF
  const blob = new Blob([htmlContent], { type: 'text/html' })
  
  return blob
}

async function gatherChecklistData(carId: string): Promise<ChecklistData> {
  // Get car data
  const { data: carData } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .single()

  // Get checklist items
  const { data: checklistItems } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('car_id', carId)
    .order('section', { ascending: true })
    .order('item_key', { ascending: true })

  // Get media
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('car_id', carId)
    .order('created_at', { ascending: true })

  // Group checklist items by section and sort by status
  const sections = CHECKLIST_SECTIONS.map(section => {
    const sectionItems = (checklistItems || []).filter(item => item.section === section.key)
    
    // Sort items by status: issue (ongelma) first, warning (huomio) second, ok third, then no status
    const sortedItems = sectionItems.sort((a, b) => {
      const statusOrder = { 'issue': 0, 'warning': 1, 'ok': 2, null: 3 }
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3
      return aOrder - bOrder
    })
    
    return {
      section: section.key,
      title: section.title,
      items: sortedItems
    }
  })

  return {
    car: carData,
    sections,
    media: media || []
  }
}

function calculateSummaryStats(data: ChecklistData) {
  let totalOk = 0
  let totalWarning = 0
  let totalIssue = 0
  let totalChecked = 0
  let totalItems = 0

  data.sections.forEach(section => {
    section.items.forEach(item => {
      totalItems++
      if (item.status) {
        totalChecked++
        if (item.status === 'ok') totalOk++
        else if (item.status === 'warning') totalWarning++
        else if (item.status === 'issue') totalIssue++
      }
    })
  })

  const completionPercentage = totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0
  const okPercentage = totalChecked > 0 ? Math.round((totalOk / totalChecked) * 100) : 0
  const warningPercentage = totalChecked > 0 ? Math.round((totalWarning / totalChecked) * 100) : 0
  const issuePercentage = totalChecked > 0 ? Math.round((totalIssue / totalChecked) * 100) : 0

  return {
    totalOk,
    totalWarning,
    totalIssue,
    totalChecked,
    totalItems,
    completionPercentage,
    okPercentage,
    warningPercentage,
    issuePercentage
  }
}

function generateHTMLContent(data: ChecklistData): string {
  const currentDate = new Date().toLocaleDateString('fi-FI')
  
  // Calculate summary statistics
  const summary = calculateSummaryStats(data)
  
  return `
<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ajokunto Raportti - ${data.car.registration_number}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
        }
        .car-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        .section-header {
            background: #007bff;
            color: white;
            padding: 10px 15px;
            font-weight: bold;
        }
        .section-content {
            padding: 15px;
        }
        .checklist-item {
            border-bottom: 1px solid #eee;
            padding: 10px 0;
        }
        .checklist-item:last-child {
            border-bottom: none;
        }
        .item-name {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .item-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
            line-height: 1.4;
        }
        .status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-ok {
            background: #d4edda;
            color: #155724;
        }
        .status-warning {
            background: #fff3cd;
            color: #856404;
        }
        .status-issue {
            background: #f8d7da;
            color: #721c24;
        }
        .status-none {
            background: #e9ecef;
            color: #6c757d;
        }
        .comment {
            margin-top: 5px;
            font-style: italic;
            color: #666;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        .approval-section {
            margin-top: 40px;
            border: 2px solid #007bff;
            border-radius: 5px;
            padding: 20px;
        }
        .approval-boxes {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
        }
        .approval-box {
            width: 45%;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
        .signature-line {
            border-bottom: 1px solid #333;
            height: 50px;
            margin: 20px 0 10px 0;
        }
        .summary-section {
            background: #f8f9fa;
            border: 2px solid #007bff;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
        }
        .summary-stats {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
        }
        .stat-item {
            text-align: center;
            padding: 10px;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
        }
        .stat-ok { color: #28a745; }
        .stat-warning { color: #ffc107; }
        .stat-issue { color: #dc3545; }
        .stat-total { color: #007bff; }
        .progress-bar {
            width: 100%;
            height: 30px;
            background-color: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
            position: relative;
        }
        .progress-segment {
            height: 100%;
            float: left;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .progress-ok { background-color: #28a745; }
        .progress-warning { background-color: #ffc107; }
        .progress-issue { background-color: #dc3545; }
        .completion-badge {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin: 10px 0;
        }
        @media print {
            body {
                max-width: none;
                margin: 0;
                padding: 15px;
            }
            .approval-section {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Ajokunto.fi</h1>
        <h2>Tarkastusraportti</h2>
        <p>Luotu: ${currentDate}</p>
    </div>

    <div class="car-info">
        <h3>Ajoneuvon tiedot</h3>
        <p><strong>Rekisterinumero:</strong> ${data.car.registration_number}</p>
        ${data.car.make ? `<p><strong>Merkki:</strong> ${data.car.make}</p>` : ''}
        ${data.car.model ? `<p><strong>Malli:</strong> ${data.car.model}</p>` : ''}
        ${data.car.year ? `<p><strong>Vuosimalli:</strong> ${data.car.year}</p>` : ''}
    </div>

    <div class="summary-section">
        <h3>📊 Tarkastuksen yhteenveto</h3>
        
        <div class="completion-badge">
            Tarkastusaste: ${summary.completionPercentage}% (${summary.totalChecked}/${summary.totalItems} kohtaa)
        </div>
        
        <div class="summary-stats">
            <div class="stat-item">
                <div class="stat-number stat-issue">${summary.totalIssue}</div>
                <div class="stat-label">Ongelma</div>
            </div>
            <div class="stat-item">
                <div class="stat-number stat-warning">${summary.totalWarning}</div>
                <div class="stat-label">Huomio</div>
            </div>
            <div class="stat-item">
                <div class="stat-number stat-ok">${summary.totalOk}</div>
                <div class="stat-label">OK</div>
            </div>
            <div class="stat-item">
                <div class="stat-number stat-total">${summary.totalChecked}</div>
                <div class="stat-label">Tarkastettu</div>
            </div>
        </div>
        
        ${summary.totalChecked > 0 ? `
        <div class="progress-bar">
            ${summary.issuePercentage > 0 ? `<div class="progress-segment progress-issue" style="width: ${summary.issuePercentage}%">${summary.issuePercentage > 10 ? summary.issuePercentage + '%' : ''}</div>` : ''}
            ${summary.warningPercentage > 0 ? `<div class="progress-segment progress-warning" style="width: ${summary.warningPercentage}%">${summary.warningPercentage > 10 ? summary.warningPercentage + '%' : ''}</div>` : ''}
            ${summary.okPercentage > 0 ? `<div class="progress-segment progress-ok" style="width: ${summary.okPercentage}%">${summary.okPercentage > 10 ? summary.okPercentage + '%' : ''}</div>` : ''}
        </div>
        ` : ''}
        
        <p style="font-size: 14px; color: #666; margin-top: 15px;">
            <strong>Tulkinta:</strong> 
            ${summary.totalIssue > 0 ? '🔴 Löytyi ongelmia jotka vaativat huomiota.' : 
              summary.totalWarning > 0 ? '🟡 Muutamia huomioita, mutta ei vakavia ongelmia.' : 
              summary.totalOk > 0 ? '🟢 Tarkastetut kohdat ovat kunnossa.' : 
              '⚪ Tarkastus kesken.'}
        </p>
    </div>

    ${data.sections.map(section => `
        <div class="section">
            <div class="section-header">
                ${section.title}
            </div>
            <div class="section-content">
                ${section.items.length > 0 ? section.items.map(item => {
                    const itemData = getChecklistItem(section.section, item.item_key)
                    return `
                    <div class="checklist-item">
                        <div class="item-name">
                            ${itemData?.title || item.item_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        ${itemData?.description ? `<div class="item-description">${itemData.description}</div>` : ''}
                        <div>
                            <span class="status status-${item.status || 'none'}">
                                ${item.status === 'ok' ? 'OK' : 
                                  item.status === 'warning' ? 'Huomio' : 
                                  item.status === 'issue' ? 'Ongelma' : 'Ei tarkastettu'}
                            </span>
                            ${item.comment ? `<div class="comment">${item.comment}</div>` : ''}
                        </div>
                    </div>
                `}).join('') : '<p>Ei tarkastettuja kohtia</p>'}
            </div>
        </div>
    `).join('')}

    <div class="approval-section">
        <h3>Hyväksynnät</h3>
        <p>Allekirjoittamalla vahvistan, että olen tutustunut tarkastusraporttiin ja hyväksyn sen sisällön.</p>
        
        <div class="approval-boxes">
            <div class="approval-box">
                <h4>Myyjä</h4>
                <div class="signature-line"></div>
                <p>Allekirjoitus ja nimen selvennys</p>
                <p>Päivämäärä: ________________</p>
            </div>
            
            <div class="approval-box">
                <h4>Ostaja</h4>
                <div class="signature-line"></div>
                <p>Allekirjoitus ja nimen selvennys</p>
                <p>Päivämäärä: ________________</p>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>Tämä raportti on luotu Ajokunto.fi -palvelulla. Lisätietoja: https://ajokunto.fi</p>
        <p><strong>Huomio:</strong> Tämä raportti perustuu käyttäjien syöttämiin tietoihin eikä korvaa ammattimaista tarkastusta.</p>
    </div>
</body>
</html>
  `
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  // Change extension to .html since we're creating HTML content
  const htmlFilename = filename.replace(/\.pdf$/i, '.html')
  a.download = htmlFilename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}