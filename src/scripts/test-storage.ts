#!/usr/bin/env tsx
/**
 * 新存储方案测试脚本
 * 测试DrawingStorageManager的各项功能
 */

import { DrawingStorageManager } from "@/lib/drawing-storage-server";

async function testStorageManager() {
  console.log("🧪 开始测试新存储方案...\n");

  const testDrawingId = `test-${Date.now()}`;
  const testMetadata = {
    name: "测试画图",
    desc: "这是一个测试画图",
    userId: "test-user-123",
    parentFolderId: "test-folder-456",
    isFavorite: false,
  };

  const testDrawingData = {
    elements: [
      { id: "1", type: "rectangle", x: 10, y: 10, width: 100, height: 50 },
      { id: "2", type: "text", x: 50, y: 100, text: "Hello World" }
    ],
    files: {
      "file1": { data: "base64encodeddata..." },
      "file2": { data: "anotherbase64data..." }
    },
    appState: { theme: "light", zoom: 1.0 }
  };

  try {
    // 1. 测试创建drawing
    console.log("1️⃣ 测试创建drawing...");
    const createdId = await DrawingStorageManager.createDrawing(testMetadata, testDrawingData);
    console.log(`✅ 创建成功，ID: ${createdId}\n`);

    // 2. 测试获取drawing
    console.log("2️⃣ 测试获取drawing...");
    const retrievedData = await DrawingStorageManager.getDrawing(createdId);
    console.log(`✅ 获取成功:`);
    console.log(`   - 元素数量: ${retrievedData.elements?.length || 0}`);
    console.log(`   - 文件数量: ${Object.keys(retrievedData.files || {}).length}`);
    console.log(`   - 画图名称: ${retrievedData.metadata?.name}\n`);

    // 3. 测试更新drawing
    console.log("3️⃣ 测试更新drawing...");
    const updatedMetadata = { name: "更新后的测试画图" };
    const updatedData = {
      elements: [...testDrawingData.elements, { id: "3", type: "circle", x: 200, y: 200, radius: 30 }],
      files: testDrawingData.files,
      appState: testDrawingData.appState
    };
    
    await DrawingStorageManager.updateDrawing(createdId, updatedMetadata, updatedData);
    console.log(`✅ 更新成功\n`);

    // 4. 验证更新
    console.log("4️⃣ 验证更新结果...");
    const updatedRetrievedData = await DrawingStorageManager.getDrawing(createdId);
    console.log(`✅ 验证成功:`);
    console.log(`   - 新元素数量: ${updatedRetrievedData.elements?.length || 0}`);
    console.log(`   - 画图名称: ${updatedRetrievedData.metadata?.name}\n`);

    // 5. 测试删除drawing
    console.log("5️⃣ 测试删除drawing...");
    await DrawingStorageManager.deleteDrawing(createdId);
    console.log(`✅ 删除成功\n`);

    // 6. 验证删除
    console.log("6️⃣ 验证删除结果...");
    try {
      await DrawingStorageManager.getDrawing(createdId);
      console.log(`❌ 删除验证失败：仍能获取到已删除的数据`);
    } catch (error) {
      console.log(`✅ 删除验证成功：无法获取已删除的数据\n`);
    }

    console.log("🎉 所有测试通过！新存储方案工作正常。");

  } catch (error) {
    console.error("❌ 测试失败:", error);
    
    // 清理测试数据
    try {
      await DrawingStorageManager.deleteDrawing(testDrawingId);
      console.log("🧹 已清理测试数据");
    } catch (cleanupError) {
      console.error("清理测试数据失败:", cleanupError);
    }
    
    process.exit(1);
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// 执行测试
testStorageManager().catch((error) => {
  console.error("测试脚本执行失败:", error);
  process.exit(1);
});