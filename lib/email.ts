import { Resend } from 'resend'

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  city: string
  items: Array<{
    productName: string
    fabricName: string
    total: number
  }>
  total: number
}

export async function sendOrderEmail(data: OrderEmailData) {
  const apiKey = process.env.RESEND_API_KEY
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@punjabi-shop.com'

  if (!apiKey) {
    console.log('--- ORDER EMAIL (RESEND_API_KEY not set) ---')
    console.log(`To: ${adminEmail}`)
    console.log(`Subject: New Order ${data.orderNumber}`)
    console.log(`Order Details:`, data)
    console.log('--- END EMAIL ---')
    return
  }

  const resend = new Resend(apiKey)

  const itemsList = data.items
    .map(item => `- ${item.productName} (${item.fabricName}): ৳${item.total}`)
    .join('\n')

  const emailContent = `
New Order Placed!

Order Number: ${data.orderNumber}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Address: ${data.address}, ${data.city}

Items:
${itemsList}

Total: ৳${data.total}

Someone will call the customer shortly to confirm details.
  `.trim()

  try {
    await resend.emails.send({
      from: 'Punjabi Shop <orders@punjabi-shop.com>',
      to: [adminEmail],
      ...(data.customerEmail ? { cc: [data.customerEmail] } : {}),
      subject: `New Order ${data.orderNumber} - Someone will call you shortly`,
      text: emailContent,
    })
  } catch (error) {
    console.error('Resend error:', error)
    throw error
  }
}
