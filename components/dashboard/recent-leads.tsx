import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Phone } from "lucide-react"

const mockLeads = [
  {
    id: "1",
    name: "João Silva",
    vehicle: "Honda Civic Touring",
    type: "whatsapp",
    date: "Há 2 horas",
  },
  {
    id: "2",
    name: "Maria Santos",
    vehicle: "Toyota Corolla Cross",
    type: "phone",
    date: "Há 5 horas",
  },
  {
    id: "3",
    name: "Pedro Oliveira",
    vehicle: "Jeep Compass",
    type: "whatsapp",
    date: "Ontem",
  },
  {
    id: "4",
    name: "Ana Costa",
    vehicle: "VW T-Cross",
    type: "whatsapp",
    date: "Ontem",
  },
]

export function RecentLeads() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#424242]">Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockLeads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between py-2 border-b border-[#E0E0E0] last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${lead.type === "whatsapp" ? "bg-green-100" : "bg-blue-100"}`}>
                  {lead.type === "whatsapp" ? (
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Phone className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-[#424242]">{lead.name}</p>
                  <p className="text-sm text-[#424242]/70">{lead.vehicle}</p>
                </div>
              </div>
              <p className="text-sm text-[#424242]/70">{lead.date}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4 bg-transparent">
          Ver Todos os Leads
        </Button>
      </CardContent>
    </Card>
  )
}
