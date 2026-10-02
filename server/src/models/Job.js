const mongoose = require('mongoose');

const salaryRangeSchema = new mongoose.Schema(
  {
    min: {
      type: Number,
      min: 0,
    },
    max: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'USD',
    },
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: 10000,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: 100,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 120,
    },
    employmentType: {
      type: String,
      required: [true, 'Employment type is required'],
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'],
    },
    experienceRequired: {
      type: Number,
      required: [true, 'Required experience is required'],
      min: 0,
      max: 50,
      default: 0,
    },
    salaryRange: {
      type: salaryRangeSchema,
      default: () => ({}),
      validate: {
        validator(range) {
          return range.min == null || range.max == null || range.min <= range.max;
        },
        message: 'Salary minimum cannot exceed salary maximum',
      },
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator(skills) {
          return skills.every((skill) => skill.trim().length > 0);
        },
        message: 'Skills cannot contain empty values',
      },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CLOSED'],
      default: 'DRAFT',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
