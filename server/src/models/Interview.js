const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview date and time are required'],
    },
    duration: {
      type: Number,
      required: [true, 'Interview duration is required'],
      min: [1, 'Interview duration must be positive'],
    },
    mode: {
      type: String,
      required: [true, 'Interview mode is required'],
      enum: ['ONLINE', 'IN_PERSON'],
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          return this.mode !== 'ONLINE' || Boolean(value);
        },
        message: 'Meeting link is required for online interviews',
      },
    },
    location: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator(value) {
          return this.mode !== 'IN_PERSON' || Boolean(value);
        },
        message: 'Location is required for in-person interviews',
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Interview notes must be 2000 characters or fewer'],
      default: '',
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  { timestamps: true }
);

interviewSchema.index({ application: 1, scheduledAt: 1 });
interviewSchema.index({ scheduledBy: 1, scheduledAt: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
