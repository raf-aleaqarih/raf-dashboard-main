import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenance extends Document {
    name: string;
    phone: string;
    unitTitle: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const MaintenanceSchema = new Schema<IMaintenance>({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    unitTitle: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'cancelled'],
        default: 'pending'
    },
}, {
    timestamps: true,
});

export default mongoose.models.Maintenance || mongoose.model<IMaintenance>('Maintenance', MaintenanceSchema);
