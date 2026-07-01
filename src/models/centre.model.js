import mongoose, { Schema } from 'mongoose';

const centreSchema = new Schema(
  {
    logo: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Centre name is required'],
      trim: true,
      index: true,
    },
    streetAddress: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Centre = mongoose.model('Centre', centreSchema);
