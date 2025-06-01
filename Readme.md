# 🎮 Game Industry Sales Analysis (Power BI Report)

This project analyzes global video game sales using Power BI, based on the classic [vgsales.csv dataset](https://www.kaggle.com/datasets/gregorut/videogame-sales-with-ratings). The goal is to uncover trends, top-performing platforms, and regional preferences in the video game industry across decades.

📄 **Report File**: [GameIndustryAnalysis.pdf](./GameIndustryAnalysis.pdf)  
📁 **Report Format**: Available as `.pbix` (Power BI), `.pdf` (report), and `.png/.jpg` for visuals (optional)

## 📊 Dashboard Highlights

### 🔹 1. Top Genres and Platforms
- **Visuals**: Bar chart, TreeMap
- Action, Sports, and Shooter genres dominated global sales.
- PS2, X360, and Wii emerged as top-selling platforms.

### 🔹 2. Sales by Region and Year
- **Visuals**: Multi-line chart
- Shows trends across **NA**, **EU**, **JP**, and **Other** regions.
- Highlights major growth periods (e.g., mid-2000s).

### 🔹 3. Top Publishers by Global Sales
- **Visuals**: Bar chart
- Nintendo leads, followed by EA, Activision, Sony, and Ubisoft.

### 🔹 4. Top 10 Games of All Time
- **Visuals**: Horizontal bar chart
- Top games include *Wii Sports*, *GTA V*, *Super Mario Bros.*, and *Tetris*.

### 🔹 5. Regional Genre Preferences
- **Visuals**: Stacked bar chart
- Action and Sports dominate in NA and EU, while Japan leans toward Role-Playing and Puzzle.

### 🔹 6. Year-over-Year Global Sales Trend
- **Visuals**: Line chart
- Peak years: 2006–2010.
- Insights into industry decline and growth phases.

## 🔍 Dataset Columns Used

| Column         | Description                        |
|----------------|------------------------------------|
| `Name`         | Video game title                   |
| `Platform`     | Console/platform                   |
| `Year`         | Year of release                    |
| `Genre`        | Game genre                         |
| `Publisher`    | Publishing company                 |
| `NA_Sales`     | Sales in North America (millions)  |
| `EU_Sales`     | Sales in Europe (millions)         |
| `JP_Sales`     | Sales in Japan (millions)          |
| `Other_Sales`  | Sales in other regions (millions)  |
| `Global_Sales` | Total global sales (millions)      |

