import dash
import dash_bootstrap_components as dbc
from dash import dcc, html, Input, Output, dash_table
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
import random

# Data Generation
random.seed(42)
np.random.seed(42)

categories = ["IT & Software", "Professional Services", "Logistics & Freight",
              "Facilities & Real Estate", "Marketing & Media", "MRO & Supplies"]

roles = ["Category Manager", "Procurement Analyst", "Contract Specialist",
         "Sourcing Lead", "Compliance Officer", "Data Analyst"]

contracts = [f"Contract {chr(65+i)}" for i in range(12)]

n = 300
df_suppliers = pd.DataFrame({
    "Supplier_ID": [f"SUP{1000+i}" for i in range(n)],
    "Supplier_Name": [f"Supplier {i}" for i in range(n)],
    "Category": np.random.choice(categories, n),
    "Role": np.random.choice(roles, n),
    "Spend_M": np.round(np.random.choice([0.5, 1.0, 2.5, 5.0], n, p=[0.2, 0.35, 0.3, 0.15]), 2),
    "Contract": np.random.choice(contracts, n),
    "Compliance_pct": np.random.randint(50, 100, n),
    "Risk_Score": np.round(np.random.uniform(1.0, 5.0, n), 1),
})

months = pd.date_range("2024-01-01", periods=18, freq="MS")
df_forecast = []
for category in categories:
    base_demand = np.random.randint(15, 40)
    base_capacity = base_demand + np.random.randint(-5, 10)
    for i, month in enumerate(months):
        trend = i * np.random.uniform(0.3, 0.8)
        noise = np.random.randint(-3, 4)
        demand = int(base_demand + trend + noise)
        capacity = int(base_capacity + np.random.randint(-2, 3))
        df_forecast.append({
            "Month": month,
            "Category": category,
            "Planned_Spend": demand,
            "Contracted_Spend": capacity,
            "Compliance_Gap": capacity - demand,
        })
df_forecast = pd.DataFrame(df_forecast)

df_alloc = df_suppliers.groupby(["Contract", "Category"]).agg(
    Spend_Allocated=("Spend_M", "sum"),
    Supplier_Count=("Supplier_ID", "count")
).reset_index()

total_spend = df_suppliers["Spend_M"].sum()
avg_compliance = df_suppliers["Compliance_pct"].mean()
contracts_count = df_suppliers["Contract"].nunique()
categories_count = df_suppliers["Category"].nunique()

app = dash.Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.BOOTSTRAP,
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    ],
    title="Procurement Analytics Dashboard",
    suppress_callback_exceptions=True
)

BLUE = "#003f72"
COLORS = [BLUE, "#0062a3", "#4f98a3", "#437a22", "#d19900", "#da7101"]
TEMPLATE = "plotly_white"


def kpi_card(title, value, subtitle):
    return dbc.Card([
        dbc.CardBody([
            html.Span(
                title,
                style={
                    "fontSize": "0.78rem",
                    "color": "#7a7974",
                    "fontWeight": "500",
                    "textTransform": "uppercase",
                    "letterSpacing": "0.06em",
                    "display": "block",
                    "marginBottom": "8px"
                }
            ),
            html.H3(value, style={"color": BLUE, "fontWeight": "700", "fontSize": "2rem", "margin": "0"}),
            html.P(subtitle, style={"fontSize": "0.78rem", "color": "#7a7974", "margin": "4px 0 0 0"})
        ])
    ], style={
        "border": "1px solid #dcd9d5",
        "borderRadius": "12px",
        "boxShadow": "0 2px 8px rgba(0,0,0,0.06)",
        "height": "100%"
    })


app.layout = html.Div([
    html.Div([
        html.Div([
            html.Div([
                html.H5("Procurement Analytics Dashboard", style={
                    "color": "#28251d",
                    "fontWeight": "700",
                    "margin": "0",
                    "fontSize": "1.1rem"
                }),
                html.P("Contract Compliance & Spend Analytics",
                       style={"color": "#7a7974", "margin": "0", "fontSize": "0.75rem"})
            ]),
            html.Span("Live Data", style={
                "background": "#cdd8e3",
                "color": BLUE,
                "borderRadius": "20px",
                "padding": "3px 12px",
                "fontSize": "0.75rem",
                "fontWeight": "600"
            })
        ], style={
            "maxWidth": "1280px",
            "margin": "0 auto",
            "padding": "0 24px",
            "display": "flex",
            "justifyContent": "space-between",
            "alignItems": "center",
            "height": "64px"
        })
    ], style={
        "background": "#f9f8f5",
        "borderBottom": "1px solid #dcd9d5",
        "position": "sticky",
        "top": "0",
        "zIndex": "100",
        "boxShadow": "0 1px 4px rgba(0,0,0,0.05)"
    }),

    html.Div([
        dcc.Tabs(
            id="main-tabs",
            value="overview",
            children=[
                dcc.Tab(label="Overview", value="overview"),
                dcc.Tab(label="Spend Forecast", value="forecast"),
                dcc.Tab(label="Supplier Analysis", value="workforce"),
                dcc.Tab(label="Contract Allocation", value="projects"),
            ],
            style={"maxWidth": "1280px", "margin": "0 auto"},
            colors={"border": "#dcd9d5", "primary": BLUE, "background": "#f9f8f5"}
        )
    ], style={
        "background": "#f9f8f5",
        "borderBottom": "1px solid #dcd9d5",
        "padding": "0 24px"
    }),

    html.Div(id="page-content", style={
        "maxWidth": "1280px",
        "margin": "0 auto",
        "padding": "24px 24px 48px"
    })

], style={
    "fontFamily": "'Inter', sans-serif",
    "background": "#f7f6f2",
    "minHeight": "100vh"
})


@app.callback(Output("page-content", "children"), Input("main-tabs", "value"))
def render_tab(tab):
    if tab == "overview":
        return render_overview()
    elif tab == "forecast":
        return render_forecast()
    elif tab == "workforce":
        return render_suppliers()
    elif tab == "projects":
        return render_contracts()


def render_overview():
    spend_by_cat = (
        df_suppliers.groupby("Category")["Spend_M"]
        .sum()
        .reset_index()
        .sort_values("Spend_M", ascending=True)
    )
    fig_spend = px.bar(
        spend_by_cat, x="Spend_M", y="Category", orientation="h",
        color_discrete_sequence=[BLUE], template=TEMPLATE,
        title="Total Spend by Category (M)"
    )
    fig_spend.update_layout(showlegend=False, margin=dict(l=0, r=10, t=40, b=10))

    role_counts = df_suppliers["Role"].value_counts().reset_index()
    role_counts.columns = ["Role", "Count"]
    fig_roles = px.pie(
        role_counts, names="Role", values="Count", hole=0.45,
        color_discrete_sequence=COLORS, template=TEMPLATE,
        title="Procurement Team Role Distribution"
    )
    fig_roles.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    comp_matrix = df_suppliers.groupby(["Category", "Role"])["Compliance_pct"].mean().reset_index()
    comp_pivot = comp_matrix.pivot(index="Category", columns="Role", values="Compliance_pct").fillna(0)
    fig_heatmap = px.imshow(
        comp_pivot, color_continuous_scale=["#f5f5f5", BLUE],
        template=TEMPLATE, title="Avg. Compliance % (Category x Role)", aspect="auto"
    )
    fig_heatmap.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    return html.Div([
        dbc.Row([
            dbc.Col(kpi_card("Total Spend", f"${total_spend:.1f}M", "Across all categories"), md=3),
            dbc.Col(kpi_card("Avg. Compliance", f"{avg_compliance:.1f}%", "Contract adherence rate"), md=3),
            dbc.Col(kpi_card("Active Contracts", str(contracts_count), "Procurement portfolio"), md=3),
            dbc.Col(kpi_card("Spend Categories", str(categories_count), "Managed categories"), md=3),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(figure=fig_spend, config={"displayModeBar": False})])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=6),
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(figure=fig_roles, config={"displayModeBar": False})])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=6),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(figure=fig_heatmap, config={"displayModeBar": False})])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=12),
        ], className="g-3"),
    ])


def render_forecast():
    return html.Div([
        dbc.Row([
            dbc.Col([
                html.Label("Select Category", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="forecast-platform",
                    options=[{"label": c, "value": c} for c in categories],
                    value=categories[0],
                    clearable=False
                )
            ], md=4),
        ], className="mb-4"),

        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(id="forecast-chart")])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=12),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(id="gap-chart")])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=12),
        ], className="g-3"),
    ])


@app.callback(
    [Output("forecast-chart", "figure"), Output("gap-chart", "figure")],
    Input("forecast-platform", "value")
)
def update_forecast(category):
    dff = df_forecast[df_forecast["Category"] == category].copy()

    fig_fc = go.Figure()
    fig_fc.add_trace(go.Scatter(
        x=dff["Month"], y=dff["Planned_Spend"],
        mode="lines+markers", name="Planned Spend",
        line=dict(color=BLUE, width=2.5), marker=dict(size=6)
    ))
    fig_fc.add_trace(go.Scatter(
        x=dff["Month"], y=dff["Contracted_Spend"],
        mode="lines+markers", name="Contracted Spend",
        line=dict(color="#da7101", width=2.5, dash="dash"), marker=dict(size=6)
    ))
    fig_fc.update_layout(
        template=TEMPLATE, title=f"Planned vs. Contracted Spend - {category}",
        yaxis_title="Spend Units", xaxis_title="Month",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=0, r=0, t=50, b=10)
    )

    colors_gap = [BLUE if v >= 0 else "#a12c7b" for v in dff["Compliance_Gap"]]
    fig_gap = go.Figure(go.Bar(x=dff["Month"], y=dff["Compliance_Gap"], marker_color=colors_gap))
    fig_gap.add_hline(y=0, line_dash="solid", line_color="#dcd9d5")
    fig_gap.update_layout(
        template=TEMPLATE, title=f"Compliance Gap (Surplus / Deficit) - {category}",
        yaxis_title="Gap", xaxis_title="Month",
        margin=dict(l=0, r=0, t=50, b=10)
    )
    return fig_fc, fig_gap


def render_suppliers():
    return html.Div([
        dbc.Row([
            dbc.Col([
                html.Label("Filter by Category", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="wf-platform",
                    options=[{"label": "All Categories", "value": "All"}] +
                            [{"label": c, "value": c} for c in categories],
                    value="All", clearable=False
                )
            ], md=4),
            dbc.Col([
                html.Label("Filter by Role", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="wf-role",
                    options=[{"label": "All Roles", "value": "All"}] +
                            [{"label": r, "value": r} for r in roles],
                    value="All", clearable=False
                )
            ], md=4),
        ], className="mb-4"),

        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(id="wf-scatter")])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=6),
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(id="wf-box")])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=6),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(dbc.Card([
                dbc.CardBody([
                    html.H6("Supplier Details", style={"fontWeight": "600", "marginBottom": "12px"}),
                    dcc.Loading(dash_table.DataTable(
                        id="wf-table",
                        columns=[{"name": c, "id": c} for c in
                                 ["Supplier_ID", "Category", "Role", "Spend_M", "Compliance_pct", "Risk_Score"]],
                        page_size=10,
                        style_header={"backgroundColor": "#f3f0ec", "fontWeight": "600",
                                      "borderBottom": "2px solid #dcd9d5", "fontSize": "0.8rem"},
                        style_cell={"fontSize": "0.8rem", "padding": "8px 12px",
                                    "fontFamily": "'Inter', sans-serif", "border": "none",
                                    "borderBottom": "1px solid #f3f0ec"},
                        style_data_conditional=[{"if": {"row_index": "odd"}, "backgroundColor": "#fafaf8"}],
                    ))
                ])
            ], style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=12)
        ], className="g-3")
    ])


@app.callback(
    [Output("wf-scatter", "figure"), Output("wf-box", "figure"), Output("wf-table", "data")],
    [Input("wf-platform", "value"), Input("wf-role", "value")]
)
def update_suppliers(category, role):
    dff = df_suppliers.copy()
    if category != "All":
        dff = dff[dff["Category"] == category]
    if role != "All":
        dff = dff[dff["Role"] == role]

    fig_scatter = px.scatter(
        dff, x="Compliance_pct", y="Risk_Score", color="Category",
        size="Spend_M", hover_data=["Role", "Contract"],
        color_discrete_sequence=COLORS, template=TEMPLATE,
        title="Compliance Rate vs. Risk Score"
    )
    fig_scatter.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    fig_box = px.box(
        dff, x="Role", y="Compliance_pct", color="Role",
        color_discrete_sequence=COLORS, template=TEMPLATE,
        title="Compliance Distribution by Role"
    )
    fig_box.update_layout(showlegend=False, margin=dict(l=0, r=0, t=40, b=10))

    return (
        fig_scatter,
        fig_box,
        dff[["Supplier_ID", "Category", "Role", "Spend_M", "Compliance_pct", "Risk_Score"]].to_dict("records")
    )


def render_contracts():
    fig_sunburst = px.sunburst(
        df_alloc, path=["Category", "Contract"],
        values="Spend_Allocated", color="Spend_Allocated",
        color_continuous_scale=["#cdd8e3", BLUE],
        template=TEMPLATE, title="Spend Allocation: Category > Contract"
    )
    fig_sunburst.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    fig_treemap = px.treemap(
        df_alloc, path=["Category", "Contract"],
        values="Supplier_Count", color="Spend_Allocated",
        color_continuous_scale=["#e6e4df", BLUE],
        template=TEMPLATE, title="Supplier Count Treemap by Category & Contract"
    )
    fig_treemap.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    return html.Div([
        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(figure=fig_sunburst, config={"displayModeBar": False})])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=6),
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(figure=fig_treemap, config={"displayModeBar": False})])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=6),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col([
                html.Label("Select Contract", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="proj-selector",
                    options=[{"label": c, "value": c} for c in contracts],
                    value=contracts[0], clearable=False
                )
            ], md=4),
        ], className="mb-3"),

        dbc.Row([
            dbc.Col(dbc.Card([dbc.CardBody([dcc.Graph(id="proj-bar")])],
                              style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}), md=12),
        ], className="g-3"),
    ])


@app.callback(Output("proj-bar", "figure"), Input("proj-selector", "value"))
def update_contract_bar(contract):
    dff = df_suppliers[df_suppliers["Contract"] == contract]
    grp = dff.groupby(["Category", "Role"])["Spend_M"].sum().reset_index()

    fig = px.bar(
        grp, x="Category", y="Spend_M", color="Role", barmode="stack",
        color_discrete_sequence=COLORS, template=TEMPLATE,
        title=f"Spend Breakdown - {contract}"
    )
    fig.update_layout(
        margin=dict(l=0, r=0, t=40, b=10),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    return fig


if __name__ == "__main__":
    app.run(debug=True)