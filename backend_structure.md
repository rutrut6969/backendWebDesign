backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── environment.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── booking.controller.ts
│   │   ├── portfolio.controller.ts
│   │   └── review.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/
│   │   ├── User.ts
│   │   ├── Booking.ts
│   │   ├── Portfolio.ts
│   │   └── Review.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── booking.routes.ts
│   │   ├── portfolio.routes.ts
│   │   └── review.routes.ts
│   ├── services/
│   │   ├── email.service.ts
│   │   └── payment.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── app.ts
├── package.json
└── tsconfig.json