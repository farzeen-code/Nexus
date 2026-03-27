import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal.password'
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Nexus Platform" <noreply@nexus.com>',
      to,
      subject,
      html
    });

    console.log('✅ Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

export const sendMeetingNotification = async (recipientEmail, meetingDetails) => {
  const html = `
    <h2>New Meeting Request</h2>
    <p>You have received a meeting request.</p>
    <p><strong>Title:</strong> ${meetingDetails.title}</p>
    <p><strong>Date:</strong> ${new Date(meetingDetails.scheduledDate).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${meetingDetails.duration} minutes</p>
    <p>Please log in to Nexus to accept or reject this request.</p>
  `;
  
  return await sendEmail(recipientEmail, 'New Meeting Request - Nexus', html);
};

export const sendCollaborationNotification = async (recipientEmail, proposalDetails) => {
  const html = `
    <h2>New Investment Proposal</h2>
    <p>You have received a new collaboration request.</p>
    <p><strong>Title:</strong> ${proposalDetails.title}</p>
    <p><strong>Amount:</strong> ${proposalDetails.requestedAmount}</p>
    <p>Please log in to Nexus to review this proposal.</p>
  `;
  
  return await sendEmail(recipientEmail, 'New Investment Proposal - Nexus', html);
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  const html = `
    <h2>Welcome to Nexus!</h2>
    <p>Hi ${userName},</p>
    <p>Thank you for joining Nexus, the platform connecting entrepreneurs with investors.</p>
    <p>Get started by completing your profile and exploring opportunities!</p>
  `;
  
  return await sendEmail(userEmail, 'Welcome to Nexus', html);
};