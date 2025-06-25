import CarProfile from '@/components/car/CarProfile'

interface CarPageProps {
  params: { id: string; locale: string }
}

export default function CarPage({ params }: CarPageProps) {
  return <CarProfile carId={params.id} />
}