// Google Sheet structure for Contact Us form submissions
const CONTACT_SHEET_STRUCTURE = {
  // Sheet name for contact form submissions
  sheetName: 'Contact_Submissions',
  
  // Column headers and their corresponding form fields
  columns: [
    {
      header: 'Timestamp',
      field: 'timestamp',
      type: 'datetime',
      description: 'When the form was submitted'
    },
    {
      header: 'Name',
      field: 'name',
      type: 'string',
      description: 'Full name of the person submitting the form'
    },
    {
      header: 'Email',
      field: 'email',
      type: 'string',
      description: 'Email address of the person submitting the form'
    },
    {
      header: 'Subject',
      field: 'subject',
      type: 'string',
      description: 'Subject of the contact message'
    },
    {
      header: 'Message',
      field: 'message',
      type: 'string',
      description: 'The actual message content'
    },
    {
      header: 'Status',
      field: 'status',
      type: 'string',
      description: 'Status of the message (e.g., New, Read, Replied)',
      default: 'New'
    },
    {
      header: 'Language',
      field: 'language',
      type: 'string',
      description: 'Language used when submitting the form (en/fr/ar)'
    }
  ]
};

// Function to format contact form data for sheet submission
const formatContactData = (formData, language) => {
  return {
    timestamp: new Date().toISOString(),
    name: formData.name,
    email: formData.email,
    subject: formData.subject,
    message: formData.message,
    status: 'New',
    language: language
  };
};

export { CONTACT_SHEET_STRUCTURE, formatContactData }; 