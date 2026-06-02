# Procurement Analytics and Contract Compliance Dashboard

## Overview

This is an interactive web application built with Python Dash for analysing procurement spend data, contract compliance, and supplier risk across spend categories. The application uses synthetically generated data to simulate realistic Source-to-Pay analytics scenarios.

## Preview

![Dashboard Preview](/images/preview-1.jpg)
![Dashboard Preview](/images/preview-2.jpg)
![Dashboard Preview](/images/preview-3.jpg)
![Dashboard Preview](/images/preview-4.jpg)


## Requirements

- Python 3.10 or higher
- The following Python packages:

```
dash
dash-bootstrap-components
plotly
pandas
numpy
```

Install all dependencies with:

```
pip install dash dash-bootstrap-components plotly pandas numpy
```

## Running the Application

```
python app.py
```

Once running, open a browser and navigate to:

```
http://127.0.0.1:8050
```

## Application Structure

The dashboard contains four tabs:

| Tab | Description |
|---|---|
| Overview | KPI summary cards, total spend by category, procurement team role distribution, and compliance heatmap by category and role |
| Spend Forecast | 18-month planned vs. contracted spend trends and compliance gap analysis, filterable by spend category |
| Supplier Analysis | Compliance rate vs. risk score scatter plot, compliance distribution box plots, and a filterable supplier data table |
| Contract Allocation | Spend allocation sunburst chart, supplier count treemap, and a drilldown stacked bar chart per contract |

## Context

This project simulates an end-to-end procurement data transformation and compliance analytics workflow. It covers key Source-to-Pay analytics use cases including spend visibility, contract compliance monitoring, supplier risk assessment, and category-level KPI tracking.

## Notes

- All data is synthetically generated on application startup using fixed random seeds.
- No external data files or database connections are required.
- The application runs locally and does not require an internet connection after initial package installation.