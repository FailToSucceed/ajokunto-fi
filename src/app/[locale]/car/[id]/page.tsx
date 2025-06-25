import CarProfile from '@/components/car/CarProfile'

interface CarPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function CarPage({ params }: CarPageProps) {
  const { id } = await params
  return <CarProfile carId={id} />
}