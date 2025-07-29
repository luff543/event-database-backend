# 活動資料庫後端 API

該專案是一個基於 Node.js 和 Express 的活動資料庫後端 API，提供活動搜索、活動查詢和資料分析功能。系統使用 Elasticsearch 作為主要資料庫，支援高效的全文搜索和複雜的資料聚合查詢。

## 🌟 主要功能

- **活動搜索 API** - 支援多欄位搜索（名稱、描述、位置）
- **活動查詢 API** - 提供活動資料檢索和篩選
- **資料直方圖分析** - 支援時間序列和統計分析
- **地理位置搜索** - 基於 GPS 距離的位置查詢
- **跨來源資料整合** - 支援多種資料來源的活動資料
- **HTTPS 安全連接** - 使用 SSL 憑證保障資料傳輸安全

## 📋 系統需求

### 基本環境
- **Node.js**: 建議版本 >= 14.x
- **npm**: >= 6.x
- **Elasticsearch**: >= 5.x
- **作業系統**: Linux, Windows

### 硬體需求
- **記憶體**: 最少 2GB RAM
- **儲存空間**: 最少 10GB 可用空間

## 🚀 快速開始

### 1. 克隆專案

```bash
git clone <repository-url>
cd event-database-backend
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境配置

#### Elasticsearch 設定
確保 Elasticsearch 服務正在運行：


#### SSL 憑證設定
1. 將 SSL 憑證文件放置在 `certs/` 目錄下：
   - `eventgo.widm.csie.ncu.edu.tw-chain.pem` (憑證文件)
   - `eventgo.widm.csie.ncu.edu.tw-key.pem` (私鑰文件)

### 4. 配置文件修改

如需修改 Elasticsearch 連接位址，請編輯 `models/eventgo-elasticsearch/connection.js`：

```javascript
var client = new elasticsearch.Client({
  host: 'localhost:9200'  // 修改為你的 Elasticsearch 位址
});
```

### 5. 啟動應用程式

```bash
npm start
```

應用程式將在 `https://localhost:3006` 啟動。

## 🔧 詳細配置

### 環境變數

可以透過環境變數覆蓋預設設定：

```bash
# 設定端口（預設：3006）
export PORT=3006

# 啟動應用程式
npm start
```

### CORS 設定

目前 CORS 設定允許來自 `https://eventgo.widm.csie.ncu.edu.tw` 的請求。如需修改，請編輯 `app.js`：

```javascript
app.use(cors({
  origin: 'your-frontend-domain.com', // 修改為你的前端域名
  credentials: true
}));
```

## 📚 API 文檔

> 詳細的 API 資訊請參考 [EventDatabaseAPI.md](EventDatabaseAPI.md) 文件

## 🔍 故障排除

### 常見問題

**Q: 應用程式無法啟動，提示憑證文件錯誤**
A: 請確認 `certs/` 目錄下有正確的 SSL 憑證文件，或使用自簽名憑證進行測試。

**Q: Elasticsearch 連接失敗**
A: 
1. 確認 Elasticsearch 服務正在運行
2. 檢查 `models/eventgo-elasticsearch/connection.js` 中的連接位址
3. 確認防火牆設定允許 9200 端口

**Q: CORS 錯誤**
A: 修改 `app.js` 中的 CORS 設定，允許你的前端域名。

**Q: 端口衝突**
A: 修改 `app.js` 中的端口設定或使用環境變數 `PORT`。

