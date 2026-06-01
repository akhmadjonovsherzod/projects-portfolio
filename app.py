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

platforms = ["Clinical Development", "Translational Sciences", "Regulatory Affairs",
             "Biometrics & Data Science", "Pharmacovigilance", "Medical Affairs"]

roles = ["Data Scientist", "Statistician", "Clinical Scientist", "Project Manager",
         "Regulatory Specialist", "Medical Writer"]

projects = [f"Project {chr(65+i)}" for i in range(12)]

n = 300
df_workforce = pd.DataFrame({
    "Employee_ID": [f"EMP{1000+i}" for i in range(n)],
    "Name": [f"Employee {i}" for i in range(n)],
    "Platform": np.random.choice(platforms, n),
    "Role": np.random.choice(roles, n),
    "FTE": np.random.choice([0.5, 0.75, 1.0], n, p=[0.15, 0.2, 0.65]),
    "Project": np.random.choice(projects, n),
    "Availability_pct": np.random.randint(40, 100, n),
    "Skills_Score": np.round(np.random.uniform(2.5, 5.0, n), 1),
})

months = pd.date_range("2024-01-01", periods=18, freq="MS")
df_forecast = []
for platform in platforms:
    base_demand = np.random.randint(15, 40)
    base_capacity = base_demand + np.random.randint(-5, 10)
    for i, month in enumerate(months):
        trend = i * np.random.uniform(0.3, 0.8)
        noise = np.random.randint(-3, 4)
        demand = int(base_demand + trend + noise)
        capacity = int(base_capacity + np.random.randint(-2, 3))
        df_forecast.append({
            "Month": month,
            "Platform": platform,
            "Demand_FTE": demand,
            "Capacity_FTE": capacity,
            "Gap_FTE": capacity - demand,
        })
df_forecast = pd.DataFrame(df_forecast)

df_alloc = df_workforce.groupby(["Project", "Platform"]).agg(
    FTE_Allocated=("FTE", "sum"),
    Headcount=("Employee_ID", "count")
).reset_index()

total_fte = df_workforce["FTE"].sum()
avg_availability = df_workforce["Availability_pct"].mean()
projects_count = df_workforce["Project"].nunique()
platforms_count = df_workforce["Platform"].nunique()

app = dash.Dash(
    __name__,
    external_stylesheets=[
        dbc.themes.BOOTSTRAP,
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
    ],
    title="OPCM Dashboard",
    suppress_callback_exceptions=True
)

TEAL = "#01696f"
COLORS = [TEAL, "#4f98a3", "#006494", "#437a22", "#d19900", "#da7101"]
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
            html.H3(value, style={"color": TEAL, "fontWeight": "700", "fontSize": "2rem", "margin": "0"}),
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
                html.H5("OPCM Dashboard", style={
                    "color": "#28251d",
                    "fontWeight": "700",
                    "margin": "0",
                    "fontSize": "1.1rem"
                }),
                html.P("Operational Planning & Capacity Management", style={
                    "color": "#7a7974",
                    "margin": "0",
                    "fontSize": "0.75rem"
                })
            ]),
            html.Span("Live Data", style={
                "background": "#cedcd8",
                "color": TEAL,
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
                dcc.Tab(label="Capacity Forecast", value="forecast"),
                dcc.Tab(label="Workforce", value="workforce"),
                dcc.Tab(label="Project Allocation", value="projects"),
            ],
            style={"maxWidth": "1280px", "margin": "0 auto"},
            colors={"border": "#dcd9d5", "primary": TEAL, "background": "#f9f8f5"}
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
        return render_workforce()
    elif tab == "projects":
        return render_projects()


def render_overview():
    fte_by_platform = (
        df_workforce.groupby("Platform")["FTE"]
        .sum()
        .reset_index()
        .sort_values("FTE", ascending=True)
    )

    fig_platform = px.bar(
        fte_by_platform,
        x="FTE",
        y="Platform",
        orientation="h",
        color_discrete_sequence=[TEAL],
        template=TEMPLATE,
        title="FTE by Platform"
    )
    fig_platform.update_layout(showlegend=False, margin=dict(l=0, r=10, t=40, b=10))

    role_counts = df_workforce["Role"].value_counts().reset_index()
    role_counts.columns = ["Role", "Count"]
    fig_roles = px.pie(
        role_counts,
        names="Role",
        values="Count",
        hole=0.45,
        color_discrete_sequence=COLORS,
        template=TEMPLATE,
        title="Role Distribution"
    )
    fig_roles.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    avail_matrix = df_workforce.groupby(["Platform", "Role"])["Availability_pct"].mean().reset_index()
    avail_pivot = avail_matrix.pivot(index="Platform", columns="Role", values="Availability_pct").fillna(0)
    fig_heatmap = px.imshow(
        avail_pivot,
        color_continuous_scale=["#f5f5f5", TEAL],
        template=TEMPLATE,
        title="Avg. Availability % (Platform x Role)",
        aspect="auto"
    )
    fig_heatmap.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    return html.Div([
        dbc.Row([
            dbc.Col(kpi_card("Total FTE", f"{total_fte:.1f}", "Across all platforms"), md=3),
            dbc.Col(kpi_card("Avg. Availability", f"{avg_availability:.1f}%", "Current workforce"), md=3),
            dbc.Col(kpi_card("Active Projects", str(projects_count), "R&D portfolio"), md=3),
            dbc.Col(kpi_card("Platforms", str(platforms_count), "Supported teams"), md=3),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(figure=fig_platform, config={"displayModeBar": False})])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=6
            ),
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(figure=fig_roles, config={"displayModeBar": False})])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=6
            ),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(figure=fig_heatmap, config={"displayModeBar": False})])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=12
            ),
        ], className="g-3"),
    ])


def render_forecast():
    return html.Div([
        dbc.Row([
            dbc.Col([
                html.Label("Select Platform", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="forecast-platform",
                    options=[{"label": p, "value": p} for p in platforms],
                    value=platforms[0],
                    clearable=False
                )
            ], md=4),
        ], className="mb-4"),

        dbc.Row([
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(id="forecast-chart")])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=12
            ),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(id="gap-chart")])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=12
            ),
        ], className="g-3"),
    ])


@app.callback(
    [Output("forecast-chart", "figure"), Output("gap-chart", "figure")],
    Input("forecast-platform", "value")
)
def update_forecast(platform):
    dff = df_forecast[df_forecast["Platform"] == platform].copy()

    fig_fc = go.Figure()
    fig_fc.add_trace(go.Scatter(
        x=dff["Month"], y=dff["Demand_FTE"],
        mode="lines+markers",
        name="Demand (FTE)",
        line=dict(color=TEAL, width=2.5),
        marker=dict(size=6)
    ))
    fig_fc.add_trace(go.Scatter(
        x=dff["Month"], y=dff["Capacity_FTE"],
        mode="lines+markers",
        name="Capacity (FTE)",
        line=dict(color="#da7101", width=2.5, dash="dash"),
        marker=dict(size=6)
    ))
    fig_fc.update_layout(
        template=TEMPLATE,
        title=f"Demand vs. Capacity - {platform}",
        yaxis_title="FTE",
        xaxis_title="Month",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
        margin=dict(l=0, r=0, t=50, b=10)
    )

    colors_gap = [TEAL if v >= 0 else "#a12c7b" for v in dff["Gap_FTE"]]
    fig_gap = go.Figure(go.Bar(x=dff["Month"], y=dff["Gap_FTE"], marker_color=colors_gap))
    fig_gap.add_hline(y=0, line_dash="solid", line_color="#dcd9d5")
    fig_gap.update_layout(
        template=TEMPLATE,
        title=f"Capacity Gap (Surplus / Deficit) - {platform}",
        yaxis_title="Gap (FTE)",
        xaxis_title="Month",
        margin=dict(l=0, r=0, t=50, b=10)
    )

    return fig_fc, fig_gap


def render_workforce():
    return html.Div([
        dbc.Row([
            dbc.Col([
                html.Label("Filter by Platform", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="wf-platform",
                    options=[{"label": "All Platforms", "value": "All"}] + [{"label": p, "value": p} for p in platforms],
                    value="All",
                    clearable=False
                )
            ], md=4),
            dbc.Col([
                html.Label("Filter by Role", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="wf-role",
                    options=[{"label": "All Roles", "value": "All"}] + [{"label": r, "value": r} for r in roles],
                    value="All",
                    clearable=False
                )
            ], md=4),
        ], className="mb-4"),

        dbc.Row([
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(id="wf-scatter")])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=6
            ),
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(id="wf-box")])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=6
            ),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col(
                dbc.Card([
                    dbc.CardBody([
                        html.H6("Workforce Details", style={"fontWeight": "600", "marginBottom": "12px"}),
                        dcc.Loading(
                            dash_table.DataTable(
                                id="wf-table",
                                columns=[{"name": c, "id": c} for c in
                                         ["Employee_ID", "Platform", "Role", "FTE", "Availability_pct", "Skills_Score"]],
                                page_size=10,
                                style_header={
                                    "backgroundColor": "#f3f0ec",
                                    "fontWeight": "600",
                                    "borderBottom": "2px solid #dcd9d5",
                                    "fontSize": "0.8rem"
                                },
                                style_cell={
                                    "fontSize": "0.8rem",
                                    "padding": "8px 12px",
                                    "fontFamily": "'Inter', sans-serif",
                                    "border": "none",
                                    "borderBottom": "1px solid #f3f0ec"
                                },
                                style_data_conditional=[
                                    {"if": {"row_index": "odd"}, "backgroundColor": "#fafaf8"}
                                ],
                            )
                        )
                    ])
                ], style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}),
                md=12
            )
        ], className="g-3")
    ])


@app.callback(
    [Output("wf-scatter", "figure"), Output("wf-box", "figure"), Output("wf-table", "data")],
    [Input("wf-platform", "value"), Input("wf-role", "value")]
)
def update_workforce(platform, role):
    dff = df_workforce.copy()
    if platform != "All":
        dff = dff[dff["Platform"] == platform]
    if role != "All":
        dff = dff[dff["Role"] == role]

    fig_scatter = px.scatter(
        dff,
        x="Availability_pct",
        y="Skills_Score",
        color="Platform",
        size="FTE",
        hover_data=["Role", "Project"],
        color_discrete_sequence=COLORS,
        template=TEMPLATE,
        title="Availability vs. Skills Score"
    )
    fig_scatter.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    fig_box = px.box(
        dff,
        x="Role",
        y="Availability_pct",
        color="Role",
        color_discrete_sequence=COLORS,
        template=TEMPLATE,
        title="Availability Distribution by Role"
    )
    fig_box.update_layout(showlegend=False, margin=dict(l=0, r=0, t=40, b=10))

    return (
        fig_scatter,
        fig_box,
        dff[["Employee_ID", "Platform", "Role", "FTE", "Availability_pct", "Skills_Score"]].to_dict("records")
    )


def render_projects():
    fig_sunburst = px.sunburst(
        df_alloc,
        path=["Platform", "Project"],
        values="FTE_Allocated",
        color="FTE_Allocated",
        color_continuous_scale=["#cedcd8", TEAL],
        template=TEMPLATE,
        title="FTE Allocation: Platform > Project"
    )
    fig_sunburst.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    fig_treemap = px.treemap(
        df_alloc,
        path=["Platform", "Project"],
        values="Headcount",
        color="FTE_Allocated",
        color_continuous_scale=["#e6e4df", TEAL],
        template=TEMPLATE,
        title="Headcount Treemap by Platform & Project"
    )
    fig_treemap.update_layout(margin=dict(l=0, r=0, t=40, b=10))

    return html.Div([
        dbc.Row([
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(figure=fig_sunburst, config={"displayModeBar": False})])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=6
            ),
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(figure=fig_treemap, config={"displayModeBar": False})])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=6
            ),
        ], className="g-3 mb-4"),

        dbc.Row([
            dbc.Col([
                html.Label("Select Project", style={"fontWeight": "600", "marginBottom": "6px", "display": "block"}),
                dcc.Dropdown(
                    id="proj-selector",
                    options=[{"label": p, "value": p} for p in projects],
                    value=projects[0],
                    clearable=False
                )
            ], md=4),
        ], className="mb-3"),

        dbc.Row([
            dbc.Col(
                dbc.Card(
                    [dbc.CardBody([dcc.Graph(id="proj-bar")])],
                    style={"borderRadius": "12px", "border": "1px solid #dcd9d5"}
                ),
                md=12
            ),
        ], className="g-3"),
    ])


@app.callback(Output("proj-bar", "figure"), Input("proj-selector", "value"))
def update_project_bar(project):
    dff = df_workforce[df_workforce["Project"] == project]
    grp = dff.groupby(["Platform", "Role"])["FTE"].sum().reset_index()

    fig = px.bar(
        grp,
        x="Platform",
        y="FTE",
        color="Role",
        barmode="stack",
        color_discrete_sequence=COLORS,
        template=TEMPLATE,
        title=f"FTE Breakdown - {project}"
    )
    fig.update_layout(
        margin=dict(l=0, r=0, t=40, b=10),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
    )
    return fig


if __name__ == "__main__":
    app.run(debug=True)