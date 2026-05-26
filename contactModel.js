function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function cleanEmail(value) {
  return cleanText(value, 320).toLowerCase();
}

function buildContactDocument(payload, req) {
  return {
    name: cleanText(payload.name, 120),
    email: cleanEmail(payload.email),
    phone: cleanText(payload.phone, 40),
    service: cleanText(payload.service, 80),
    budget: cleanText(payload.budget, 80),
    message: cleanText(payload.message, 2500),
    source: 'website-contact-form',
    createdAt: new Date(),
    meta: {
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
    },
  };
}

module.exports = {
  buildContactDocument,
};
