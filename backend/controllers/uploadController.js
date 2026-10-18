const uploadPhoto = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file was uploaded.' });
  }

  const host = req.get('host') || 'localhost:5005';
  const protocol = req.protocol || 'http';
  const relativeUrl = `/uploads/${req.file.filename}`;
  const fullUrl = `${protocol}://${host}${relativeUrl}`;

  return res.status(200).json({
    success: true,
    message: 'Photo uploaded successfully!',
    data: {
      url: fullUrl,
      relative_url: relativeUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
};

module.exports = { uploadPhoto };