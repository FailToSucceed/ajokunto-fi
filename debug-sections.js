// Debug script to check checklist sections
// Run this in browser console to debug

console.log('=== CHECKLIST SECTIONS DEBUG ===');

// This should show all sections including photo_documentation
import('./src/data/checklist-items.js').then(module => {
  const sections = module.CHECKLIST_SECTIONS;
  console.log('Total sections:', sections.length);
  
  sections.forEach((section, index) => {
    console.log(`${index + 1}. ${section.key} - ${section.title} (${section.items.length} items)`);
    if (section.key === 'photo_documentation') {
      console.log('   PHOTO DOCUMENTATION SECTION FOUND!');
      console.log('   Items:', section.items.map(item => item.key));
    }
  });
  
  const photoSection = sections.find(s => s.key === 'photo_documentation');
  if (photoSection) {
    console.log('Photo section details:', photoSection);
  } else {
    console.error('Photo documentation section NOT FOUND!');
  }
}).catch(error => {
  console.error('Error loading sections:', error);
});