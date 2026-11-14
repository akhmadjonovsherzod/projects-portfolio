# Customer Churn Analysis

A Power BI customer churn analysis project built to turn raw customer
data into a structured, business-focused dashboard.

The project focuses on three questions:

-   **How serious is customer churn?**
-   **Why are customers leaving?**
-   **Which customer characteristics are associated with higher churn?**

## Dashboard

The report contains two focused pages:

### 1. Executive Overview

A high-level view of the customer base and churn situation, including:

-   Total customers
-   Churned customers
-   Churn rate
-   Churned customer charges
-   Churn by contract type
-   Churn by customer tenure
-   Churn categories

### 2. Churn Drivers

A deeper analysis of the factors associated with churn:

-   Main churn categories
-   Top churn reasons
-   Churn rate by customer service contact frequency
-   Churn rate by monthly charge group

## Data & Modeling

The dataset contains **6,687 customers** and was cleaned and transformed
in Power Query.

Key preparation steps included:

-   Data type and value standardization
-   Missing-value handling
-   Churn category/reason cleaning
-   Customer segmentation
-   Tenure grouping
-   Monthly charge grouping
-   Customer service contact grouping

The final model follows a **star schema**:

``` text
                 DimCustomer
                      |
                      |
DimGeography --- FactCustomer --- DimContract
                      |
                      |
                   DimChurn
```

### Fact table

`FactCustomer` contains customer-level measures such as:

-   Account length
-   Calls and minutes
-   Monthly charge
-   Total charges
-   Customer service calls
-   Data usage
-   Service attributes
-   Dimension keys

### Dimensions

-   `DimCustomer` --- customer characteristics and segments
-   `DimContract` --- contract and payment combinations
-   `DimGeography` --- state information
-   `DimChurn` --- churn status, category, and reason

## Key Findings

The analysis highlights several strong patterns:

-   **Competitor-related churn is the largest churn category.**
-   **Price, product dissatisfaction, and service dissatisfaction** are
    among the leading specific churn reasons.
-   Customers with **more frequent customer-service contacts show
    substantially higher churn rates**.
-   **Higher monthly-charge groups show higher churn rates** than
    lower-charge groups.

These findings represent associations in the data and should not be
interpreted as proof of causation.

## Project Structure

``` text
Customer-Churn-Analysis/
│
├── data/
│   └── source dataset
│
├── report/
│   └── Power BI report assets
│
├── pdf report/
│   └── exported report / documentation
│
├── Customer-Churn-Analysis.pbix
└── README.md
```

## Tools

**Power BI Desktop · Power Query · DAX · Star Schema · Data
Visualization**

## Purpose

This project demonstrates an end-to-end BI workflow:

**Data Import → Cleaning & Transformation → Data Modeling → Business
Questions → DAX → Visualization → Reporting**

The goal was not simply to build charts, but to create a compact
analytical model where every visual supports a business question.
