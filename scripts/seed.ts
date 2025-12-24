import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import UnitStatus from '../lib/models/UnitStatus';
import Maintenance from '../lib/models/Maintenance';

// Load env vars
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

const STATUS_LABELS = [
    "متاح للبيع",
    "مباع",
    "محجوز",
    "غير متاح"
];

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected!');

        // Fetch projects to get real IDs
        console.log('Fetching projects from API...');
        const res = await fetch("https://raf-backend-main.vercel.app/category/getAllCategoryARForDashboard");
        const data = await res.json();
        const projects = data.category || [];
        console.log(`Found ${projects.length} projects.`);

        // Seed UnitStatus
        console.log('Seeding UnitStatus...');
        await UnitStatus.deleteMany({});

        const unitStatusDocs = projects.map((project: any) => ({
            projectId: project._id,
            projectName: project.title,
            totalUnits: Math.floor(Math.random() * 50) + 10, // Random total units
            statuses: STATUS_LABELS.map(status => ({
                status,
                percentage: Math.floor(Math.random() * 25) // Roughly distributes to 100% (not exact but okay for seed)
            }))
        }));

        if (unitStatusDocs.length > 0) {
            await UnitStatus.insertMany(unitStatusDocs);
            console.log(`Seeded ${unitStatusDocs.length} UnitStatus records.`);
        }

        // Seed Maintenance
        console.log('Seeding Maintenance...');
        await Maintenance.deleteMany({});

        const maintenanceDocs = [
            {
                name: "أحمد محمد",
                phone: "0501234567",
                unitTitle: "فيلا 101 - حي الياسمين",
                description: "تسرب مياه في الحمام الرئيسي",
                status: "pending"
            },
            {
                name: "سارة علي",
                phone: "0559876543",
                unitTitle: "شقة 204 - برج الراف",
                description: "عطل في التكييف المركزي",
                status: "in-progress"
            },
            {
                name: "خالد عبدالله",
                phone: "0543210987",
                unitTitle: "دوبلكس 5 - حي النرجس",
                description: "صيانة كهرباء عامة",
                status: "completed"
            },
            {
                name: "فهد العتيبي",
                phone: "0567890123",
                unitTitle: "فيلا 12 - حي الملقا",
                description: "تغيير أقفال الأبواب",
                status: "pending"
            }
        ];

        await Maintenance.insertMany(maintenanceDocs);
        console.log(`Seeded ${maintenanceDocs.length} Maintenance records.`);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
