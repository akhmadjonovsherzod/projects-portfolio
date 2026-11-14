# Project Portfolio

This repository is a collection of the projects I have built while studying Business Informatics and working in tech. It includes finished portfolio pieces, learning exercises, and smaller practice projects. The goal is to show a range of skills across data analysis, business intelligence, automation, and basic software development.

## How this repository is organized

Projects are grouped into folders by subject area. Inside each subject folder you will find one or more individual projects, and most of those projects have their own README file with more detail, setup instructions, and screenshots.

Below is a short guide to what is in each folder.

### Business Intelligence
Reports and dashboards built to answer specific business questions, using tools like Power BI, SAS, and SAP Analytics Cloud.

- **business-intelligence/databel-customer-churn** — A Power BI dashboard analyzing why customers leave a telecom company and which customer traits are linked to higher churn.
- **business-intelligence/fond-rouge-analysis-report** — A SAP Analytics Cloud analysis for a fictional luxury retail brand, looking at revenue, refunds, and customer sentiment across different cities.
- **business-intelligence/game-industry-analysis-report** — A Power BI report on global video game sales, looking at top genres, platforms, and regional trends over time.
- **business-intelligence/sas-movie-industry-analysis** — A movie industry analysis done in SAS Enterprise Guide and visualized in Power BI, testing a few hypotheses about genre popularity and revenue.

### Data Analysis
Exploratory analysis and interactive dashboards, mostly built with Python.

- **data-analysis/procurement-and-data-transformation-dashboard** — An interactive Python Dash app for analyzing procurement spend, contract compliance, and supplier risk.
- **data-analysis/opcm-workforce-and-capacity-planning** — An interactive Python Dash app for visualizing workforce capacity and project allocation in an R&D team.
- **data-analysis/retail-analytics** — A pandas based analysis of retail transaction data, looking at customer buying habits, discount impact, and top products.
- **data-analysis/demographical-change-viz** — An analysis of world population data from 1995 to 2020, exploring growth trends and cleaning up missing values.

### Data Engineering
- **data-engineering/multisource-retail-data-pipeline** — An end to end data pipeline that pulls retail order data from three different sources, processes it with PySpark, loads it into Snowflake through dbt, and runs the whole flow on a schedule with Airflow. Built to practice real distributed data processing and a modern ELT setup, not just isolated exercises.

### Machine Learning
- **machine-learning/quant-research-and-data-engineering** — A credit risk platform that trains a model to predict the probability a borrower defaults, serves scores through a FastAPI service, stores results in PostgreSQL, and reports on the portfolio through a Power BI dashboard.
- **machine-learning/Impact-of-Gaming-Behavior-on-Academic-and-Psychological-Outcomes** — A data science project studying how gaming habits relate to academic performance and psychological wellbeing, using clustering, regression, and classification models.

### AI Chatbots
A set of browser based learning tools for medical English, each with an AI tutor built on Google Gemini.

- **ai-chatbots/medterm-ai** and **ai-chatbots/medterm-ai-v1** — Tools that teach how Latin medical terms are built from roots, prefixes, and suffixes, with bilingual content and an AI tutor chatbot.
- **ai-chatbots/nurseai** — A site for nursing students to learn English vocabulary and practice with interactive exercises and an AI tutor.
- **ai-chatbots/latin-medical-ai** — A simplified, no build tools version of the Latin medical terms chatbot.

### Power Platform Automation
- **power-platform-for-automation/it-service-ticketing-portal** — A full IT service request system built entirely on Microsoft Power Platform. It covers the data model in Dataverse, the employee facing app, automated notifications, and a management dashboard for ticket volume and resolution performance.

### MS Office / Excel VBA
- **MSOffice/Excel-VBA** (Purchase Order and Delivery Exception Analyzer) — An Excel based tool that cross checks purchase orders, goods receipts, and invoices to catch data errors and procurement issues, similar to the three way match checks used in audits.

### Platform Specific Bots
- **platform-specific-bots/dealshunter** — A Telegram bot that finds and shares the best deals from online stores.
- **platform-specific-bots/telegram-household-item-tracker-bot** — A Telegram bot for roommates to track whose turn it is to buy shared household items. It works in any group without extra setup.

### Software Development
- **software-development/novainvoice** — A desktop invoicing application in Python for small businesses, with partner and product management, invoice creation, and basic reporting.

### Web Development
Front end practice projects built while learning React and plain HTML/CSS.

- **web-development/eduon** — The teacher panel for an education platform, built during an internship, with course management and a performance dashboard.
- **web-development/instagram-clone** — An Instagram style app built with React and Firebase, with posting, likes, and a live feed.
- **web-development/netflix-clone** — A Netflix style app built with React and Firebase, with movie categories and trailer playback.
- **web-development/youtube** — A static clone of the YouTube homepage layout, built with plain HTML and CSS.

### Learning Folders
These folders hold practice exercises and course work rather than finished projects. They are kept here to show ongoing learning.

- **python-learning/python101** — Exercises covering core Python, automated testing, and SQL with relational databases.
- **sql-learning/sql101** — SQL practice tasks and schemas.
- **numpy-pandas-pyspark-learning** — Weekly assignments practicing numpy, pandas, and PySpark.

## Notes

Each project folder generally contains its own README with setup steps, the tools used, and screenshots where relevant. Some projects use synthetic or sample data created specifically for that project, since the goal is to demonstrate technique rather than share real company data.

If you are reviewing this portfolio for a job application or similar purpose, the projects most worth a close look are the IT Service Portal, the credit risk platform, the multi source retail data pipeline, and the Purchase Order and Delivery Exception Analyzer, since these are the most complete, end to end pieces of work.
