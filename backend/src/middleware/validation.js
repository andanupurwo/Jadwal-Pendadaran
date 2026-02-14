import { body, param, query, validationResult } from 'express-validator';

// Validation error handler middleware
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(e => ({
        field: e.param,
        message: e.msg,
        value: e.value
      }))
    });
  }
  next();
};

// Login validation
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username diperlukan')
    .isLength({ min: 3, max: 50 }).withMessage('Username harus 3-50 karakter')
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username hanya boleh alphanumeric, underscore, dash, dot'),
  body('password')
    .notEmpty().withMessage('Password diperlukan')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  handleValidationErrors
];

// Update account validation
export const validateUpdateAccount = [
  body('currentPassword')
    .notEmpty().withMessage('Password lama diperlukan'),
  body('newUsername')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username baru harus 3-50 karakter')
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username hanya boleh alphanumeric'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  handleValidationErrors
];

// Create slots validation
export const validateCreateSlots = [
  body('slots')
    .isArray({ min: 1 }).withMessage('Slots harus array minimal 1 item'),
  body('slots[*].date')
    .trim()
    .notEmpty().withMessage('Date diperlukan')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format date harus YYYY-MM-DD'),
  body('slots[*].time')
    .trim()
    .notEmpty().withMessage('Time diperlukan')
    .matches(/^\d{2}:\d{2}$/).withMessage('Format time harus HH:MM'),
  body('slots[*].room')
    .trim()
    .notEmpty().withMessage('Room diperlukan')
    .isLength({ max: 50 }).withMessage('Room maksimal 50 karakter'),
  body('slots[*].student')
    .trim()
    .notEmpty().withMessage('Student name diperlukan')
    .isLength({ max: 255 }).withMessage('Student name maksimal 255 karakter'),
  body('slots[*].examiners')
    .optional()
    .isArray().withMessage('Examiners harus array'),
  handleValidationErrors
];

// Create dosen validation  
export const validateCreateDosen = [
  body('nik')
    .trim()
    .notEmpty().withMessage('NIK diperlukan')
    .isLength({ max: 50 }).withMessage('NIK maksimal 50 karakter'),
  body('nama')
    .trim()
    .notEmpty().withMessage('Nama diperlukan')
    .isLength({ min: 3, max: 255 }).withMessage('Nama harus 3-255 karakter'),
  body('prodi')
    .trim()
    .notEmpty().withMessage('Program Studi diperlukan')
    .isLength({ max: 100 }).withMessage('Prodi maksimal 100 karakter'),
  body('max_slots')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('max_slots harus 0-100'),
  handleValidationErrors
];

// Create mahasiswa validation
export const validateCreateMahasiswa = [
  body('nim')
    .trim()
    .notEmpty().withMessage('NIM diperlukan')
    .isLength({ max: 20 }).withMessage('NIM maksimal 20 karakter'),
  body('nama')
    .trim()
    .notEmpty().withMessage('Nama diperlukan')
    .isLength({ min: 3, max: 255 }).withMessage('Nama harus 3-255 karakter'),
  body('prodi')
    .trim()
    .notEmpty().withMessage('Program Studi diperlukan'),
  body('gender')
    .optional()
    .isIn(['Laki-laki', 'Perempuan']).withMessage('Gender harus Laki-laki atau Perempuan'),
  handleValidationErrors
];

// Date parameter validation
export const validateDateParam = [
  param('date')
    .trim()
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format date harus YYYY-MM-DD'),
  handleValidationErrors
];

// Libur validation
export const validateCreateLibur = [
  body('date')
    .trim()
    .notEmpty().withMessage('Date diperlukan')
    .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Format date harus YYYY-MM-DD'),
  body('time')
    .optional()
    .trim()
    .matches(/^\d{2}:\d{2}/).withMessage('Format time harus HH:MM'),
  body('nik')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('NIK maksimal 50 karakter'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage('Reason maksimal 255 karakter'),
  handleValidationErrors
];

export default {
  handleValidationErrors,
  validateLogin,
  validateUpdateAccount,
  validateCreateSlots,
  validateCreateDosen,
  validateCreateMahasiswa,
  validateDateParam,
  validateCreateLibur
};
