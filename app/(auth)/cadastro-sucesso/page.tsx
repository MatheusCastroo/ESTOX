import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="pt-8 text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#424242] mb-2">Conta criada com sucesso!</h2>
        <p className="text-[#424242]/70 mb-6">
          Enviamos um e-mail de confirmação para você. Por favor, verifique sua caixa de entrada e clique no link para
          ativar sua conta.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-[#424242]/70 mb-6">
          <Mail className="h-4 w-4" />
          <span>Verifique também a pasta de spam</span>
        </div>
        <Link href="/login">
          <Button className="bg-[#1A73E8] hover:bg-[#0D47A1]">Ir para o login</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
