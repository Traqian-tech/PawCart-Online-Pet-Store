import { connectDB } from "./db";
import { Product } from "@shared/models";

/**
 * Script to mark certain products as member-exclusive
 * Run this to add isMemberExclusive flag to selected premium products
 */

async function markMemberExclusiveProducts() {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Marking premium products as member-exclusive...");

    // Mark high-end Royal Canin products as member exclusive
    const result = await Product.updateMany(
      {
        $or: [
          // High-priced premium products
          { price: { $gte: 50 } },
          // Royal Canin premium lines
          { name: { $regex: /Persian|British Shorthair|Maine Coon|Indoor 27/i } },
          // Luxury items
          { name: { $regex: /Premium|Luxury|VIP|Exclusive/i } }
        ]
      },
      {
        $set: { isMemberExclusive: true }
      }
    );

    console.log(`✅ Marked ${result.modifiedCount} products as member-exclusive`);

    // Show some examples
    const memberProducts = await Product.find({ isMemberExclusive: true })
      .limit(10)
      .select('name price isMemberExclusive');

    console.log("\n📦 Sample Member-Exclusive Products:");
    memberProducts.forEach(product => {
      console.log(`  - ${product.name} ($${product.price})`);
    });

    console.log("\n✨ Script completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  markMemberExclusiveProducts();
}

export { markMemberExclusiveProducts };






