import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Debug logging
console.log('Email configuration check:');
console.log('Current EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD exists:', !!process.env.EMAIL_APP_PASSWORD);

if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
  console.error('Email configuration missing. Please set EMAIL_USER and EMAIL_APP_PASSWORD in .env file');
}

// Create a transporter using Gmail
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ylogxevent@gmail.com',
      pass:  'cztp bqtf bxdr bflx'
    },
    debug: true
  });
};

// Create a new transporter for each email send to ensure fresh credentials
export const sendEventRegistrationEmail = async (userEmail, eventDetails) => {
  try {
    console.log('Attempting to send email to:', userEmail);
    console.log('Using email configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD
    });

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Registration Confirmation: ${eventDetails.title}`,
      html: `
        <h2>Event Registration Confirmation</h2>
        <p>Thank you for registering for the event!</p>
        
        <h3>Event Details:</h3>
        <ul>
          <li><strong>Event:</strong> ${eventDetails.title}</li>
          <li><strong>Date:</strong> ${eventDetails.date}</li>
          <li><strong>Time:</strong> ${eventDetails.time}</li>
          <li><strong>Location:</strong> ${eventDetails.location}</li>
          ${eventDetails.meet_link ? `<li><strong>Meeting Link:</strong> <a href="${eventDetails.meet_link}">${eventDetails.meet_link}</a></li>` : ''}
        </ul>

        ${eventDetails.meet_link ? 
          `<p>Please save this email for your records. You can use the meeting link above to join the event at the scheduled time.</p>` 
          : '<p>Please save this email for your records.</p>'
        }
        
        <p>If you have any questions, please contact the event organizer.</p>
      `
    };

    // Verify transporter configuration before sending
    await transporter.verify();
    console.log('Transporter verified successfully');

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', userEmail);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const sendBroadcastEmail = async (recipients, eventDetails, subject, message, includeEventDetails) => {
  try {
    console.log('Attempting to send broadcast email to:', recipients);
    console.log('Using email configuration:', {
      user: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD
    });

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients.join(', '),
      subject: `${eventDetails.title}: ${subject}`,
      html: `
        <h2>${eventDetails.title}</h2>
        <div style="margin-bottom: 20px;">
          ${message}
        </div>
        
        ${includeEventDetails ? `
          <hr />
          
          <h3>Event Details:</h3>
          <ul>
            <li><strong>Date:</strong> ${eventDetails.date}</li>
            <li><strong>Time:</strong> ${eventDetails.time}</li>
            <li><strong>Location:</strong> ${eventDetails.location}</li>
            ${eventDetails.meet_link ? `<li><strong>Meeting Link:</strong> <a href="${eventDetails.meet_link}">${eventDetails.meet_link}</a></li>` : ''}
          </ul>
        ` : ''}
      `
    };

    // Verify transporter configuration before sending
    await transporter.verify();
    console.log('Transporter verified successfully');

    await transporter.sendMail(mailOptions);
    console.log('Broadcast email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}; 