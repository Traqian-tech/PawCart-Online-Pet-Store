import { Coupon } from "@shared/models";

export async function initDemoCoupons() {
  try {
    console.log('Initializing demo coupons...');

    const demoCoupons = [
      {
        code: 'WELCOME10',
        description: 'Welcome bonus - 10% off for new customers',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 100,
        maxDiscountAmount: 50,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        usageLimit: 1000,
        usedCount: 0,
        isActive: true
      },
      {
        code: 'REFERRAL20',
        description: 'Referral reward - $20 off',
        discountType: 'fixed',
        discountValue: 20,
        minOrderAmount: 150,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        usageLimit: 500,
        usedCount: 0,
        isActive: true
      },
      {
        code: 'REWARD50',
        description: 'Points redemption - $50 off',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 300,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        usageLimit: 200,
        usedCount: 0,
        isActive: true
      },
      {
        code: 'SUMMER15',
        description: 'Summer sale - 15% off',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 200,
        maxDiscountAmount: 100,
        validFrom: new Date('2024-06-01'),
        validUntil: new Date('2024-08-31'),
        usageLimit: 500,
        usedCount: 0,
        isActive: false // Expired
      },
      {
        code: 'NEWSLETTER5',
        description: 'Newsletter subscription bonus - $5 off',
        discountType: 'fixed',
        discountValue: 5,
        minOrderAmount: 50,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        usageLimit: 1000,
        usedCount: 0,
        isActive: true
      },
      {
        code: 'FREEDEL1234',
        description: 'Free delivery voucher - $10 shipping fee waived',
        discountType: 'free_delivery',
        discountValue: 10, // Shipping fee value
        minOrderAmount: 0,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-31'),
        usageLimit: 1,
        usedCount: 0,
        isActive: true
      },
      {
        code: 'FREEDEL9876',
        description: 'Free delivery voucher - $10 shipping fee waived',
        discountType: 'free_delivery',
        discountValue: 10,
        minOrderAmount: 0,
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-12-15'),
        usageLimit: 1,
        usedCount: 0,
        isActive: true
      }
    ];

    for (const couponData of demoCoupons) {
      const existing = await Coupon.findOne({ code: couponData.code });
      if (!existing) {
        const coupon = new Coupon(couponData);
        await coupon.save();
        console.log(`✓ Created coupon: ${couponData.code}`);
      } else {
        console.log(`- Coupon already exists: ${couponData.code}`);
      }
    }

    console.log('Demo coupons initialized successfully!');
  } catch (error) {
    console.error('Error initializing demo coupons:', error);
  }
}

