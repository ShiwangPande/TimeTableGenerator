import nodemailer from 'nodemailer'

export interface NotificationData {
  to: string
  subject: string
  html: string
  from?: string
}

export interface TimetableChangeNotification {
  teacherEmail: string
  teacherName: string
  className: string
  subjectName: string
  dayOfWeek: string
  timeSlot: string
  roomName: string
  changeType: 'created' | 'updated' | 'deleted' | 'swapped'
}

export interface SwapRequestNotification {
  requesterEmail: string
  requesterName: string
  targetTeacherEmail: string
  targetTeacherName: string
  className: string
  subjectName: string
  dayOfWeek: string
  timeSlot: string
  roomName: string
}

export class NotificationService {
  private static transporter: nodemailer.Transporter | null = null

  static initialize() {
    // Use Gmail SMTP (free tier) or console logging for development
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      })
    }
  }

  static async sendTimetableChangeNotification(data: TimetableChangeNotification) {
    const subject = `Timetable ${data.changeType.charAt(0).toUpperCase() + data.changeType.slice(1)} - ${data.className}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Timetable Update</h2>
        <p>Hello ${data.teacherName},</p>
        <p>A timetable entry has been <strong>${data.changeType}</strong> for your class:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Class:</strong> ${data.className}</p>
          <p><strong>Subject:</strong> ${data.subjectName}</p>
          <p><strong>Day:</strong> ${data.dayOfWeek}</p>
          <p><strong>Time:</strong> ${data.timeSlot}</p>
          <p><strong>Room:</strong> ${data.roomName}</p>
        </div>
        
        <p>Please log in to your timetable dashboard to view the changes.</p>
        
        <p>Best regards,<br>TimeTable Generator Team</p>
      </div>
    `

    return this.sendEmail({
      to: data.teacherEmail,
      subject,
      html,
      from: process.env.GMAIL_USER || 'noreply@yourschool.com'
    })
  }

  static async sendSwapRequestNotification(data: SwapRequestNotification) {
    try {
      const subject = `Timetable Swap Request - ${data.className}`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Timetable Swap Request</h2>
          <p>Hello ${data.targetTeacherName},</p>
          <p>${data.requesterName} has requested to swap a timetable slot with you:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Class:</strong> ${data.className}</p>
            <p><strong>Subject:</strong> ${data.subjectName}</p>
            <p><strong>Day:</strong> ${data.dayOfWeek}</p>
            <p><strong>Time:</strong> ${data.timeSlot}</p>
            <p><strong>Room:</strong> ${data.roomName}</p>
          </div>
          
          <p>Please log in to your timetable dashboard to approve or reject this request.</p>
          
          <p>Best regards,<br>TimeTable Generator Team</p>
        </div>
      `

      return await this.sendEmail({
        to: data.targetTeacherEmail,
        subject,
        html,
        from: process.env.GMAIL_USER || 'noreply@yourschool.com'
      })
    } catch (error) {
      console.error('Failed to send swap request notification:', error)
      // Don't throw error - just log it to prevent breaking the swap request
      return { success: false, error: 'Notification failed but swap request was created' }
    }
  }

  static async sendSwapRequestConfirmation(data: SwapRequestNotification) {
    try {
      const subject = `Swap Request Sent - ${data.className}`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">Swap Request Confirmation</h2>
          <p>Hello ${data.requesterName},</p>
          <p>Your timetable swap request has been sent to ${data.targetTeacherName}.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Class:</strong> ${data.className}</p>
            <p><strong>Subject:</strong> ${data.subjectName}</p>
            <p><strong>Day:</strong> ${data.dayOfWeek}</p>
            <p><strong>Time:</strong> ${data.timeSlot}</p>
            <p><strong>Room:</strong> ${data.roomName}</p>
          </div>
          
          <p>You will be notified once ${data.targetTeacherName} responds to your request.</p>
          
          <p>Best regards,<br>TimeTable Generator Team</p>
        </div>
      `

      return await this.sendEmail({
        to: data.requesterEmail,
        subject,
        html,
        from: process.env.GMAIL_USER || 'noreply@yourschool.com'
      })
    } catch (error) {
      console.error('Failed to send swap request confirmation:', error)
      // Don't throw error - just log it to prevent breaking the swap request
      return { success: false, error: 'Confirmation failed but swap request was created' }
    }
  }

  private static async sendEmail(data: NotificationData) {
    try {
      // For development, just log the email
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email Notification:')
        console.log('To:', data.to)
        console.log('Subject:', data.subject)
        console.log('Content:', data.html)
        return { success: true, data: 'Logged to console (development mode)' }
      }

      // For production, send actual email if configured
      if (!this.transporter) {
        this.initialize()
      }

      if (!this.transporter) {
        console.warn('Email service not configured, skipping email notification')
        return { success: false, error: 'Email service not configured' }
      }

      const result = await this.transporter.sendMail({
        from: data.from || 'noreply@yourschool.com',
        to: data.to,
        subject: data.subject,
        html: data.html,
      })

      return { success: true, data: result }
    } catch (error) {
      console.error('Failed to send email notification:', error)
      return { success: false, error }
    }
  }
} 