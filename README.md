# Smart-Budgeting-App
website - https://smart-budgeting-app-7gu.caffeine.xyz/

Overview
A smart budgeting application that automatically categorizes expenses and provides spending insights through visualizations and summaries.

Core Features

Expense Management
- Manual expense entry with fields for amount, description, date, and optional category
- CSV file upload for importing transaction data (amount, description, date columns)
- View list of all expenses with filtering options

Intelligent Categorization
- Automatic expense categorization using keyword-based and rule-based heuristics
- Default categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other
- Users can manually override automatic categorizations
- System learns from user corrections to improve future categorizations

Dashboard and Visualizations
- Main dashboard displaying spending overview
- Pie charts showing expense distribution by category
- Bar charts showing spending trends over time
- Total spending amount for selected time periods

Spending Analysis
- Time-based spending summaries (daily, weekly, monthly views)
- Category-wise spending breakdowns
- Comparison between different time periods

Backend Data Storage
- User expenses with amount, description, date, category, and source (manual/imported)
- Categorization rules and keywords for automatic classification
- User category preferences and manual overrides

Backend Operations
- Store and retrieve expenses
- Process CSV uploads and extract transaction data
- Apply categorization logic to new expenses
- Generate spending summaries and analytics data
- Update categorization rules based on user feedback
