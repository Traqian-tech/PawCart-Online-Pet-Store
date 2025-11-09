console.log('\n🧪 TESTING FREE DELIVERY COUPON REDEMPTION\n');
console.log('='.repeat(50));

// Simulate the redemption request from frontend
const testRedemption = async () => {
  const couponCode = `FREEDEL${Date.now().toString().slice(-4)}`;
  
  const validFrom = new Date(Date.now() - 60 * 1000);
  const validUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  
  const couponData = {
    code: couponCode,
    description: 'Points Redemption - Free Delivery',
    discountType: 'free_delivery',
    discountValue: 10, // $10 value
    minOrderAmount: 0,
    validFrom: validFrom.toISOString(),
    validUntil: validUntil.toISOString(),
    isActive: true,
    usageLimit: 1,
  };

  console.log('\n📤 Sending request to create free delivery coupon:');
  console.log(JSON.stringify(couponData, null, 2));
  
  try {
    const response = await fetch('http://localhost:5000/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });

    console.log(`\n📥 Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('\n❌ FAILED:');
      console.error(JSON.stringify(errorData, null, 2));
      return false;
    }

    const createdCoupon = await response.json();
    console.log('\n✅ SUCCESS! Coupon created:');
    console.log(JSON.stringify(createdCoupon, null, 2));
    
    // Verify the coupon was created correctly
    const verifyResponse = await fetch(`http://localhost:5000/api/coupons/${createdCoupon._id}`);
    const verifiedCoupon = await verifyResponse.json();
    
    console.log('\n🔍 Verification:');
    console.log(`Code: ${verifiedCoupon.code}`);
    console.log(`Type: ${verifiedCoupon.discountType}`);
    console.log(`Value: $${verifiedCoupon.discountValue}`);
    console.log(`Active: ${verifiedCoupon.isActive}`);
    console.log(`Usage: ${verifiedCoupon.usedCount}/${verifiedCoupon.usageLimit}`);
    
    if (verifiedCoupon.discountType === 'free_delivery') {
      console.log('\n✅ FREE DELIVERY COUPON REDEMPTION WORKS!');
      return true;
    } else {
      console.log('\n❌ Type mismatch!');
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  }
};

// Wait for server to be ready
setTimeout(async () => {
  const success = await testRedemption();
  console.log('\n' + '='.repeat(50));
  console.log(success ? '🎉 TEST PASSED' : '❌ TEST FAILED');
  process.exit(success ? 0 : 1);
}, 3000);

