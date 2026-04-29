# Configuration Guide: Apify & Google Sheets

Follow these steps to set up and configure the nodes in your workflow.

## 1. Apify Configuration (Google Maps Scraper)

Apify allows you to scrape data from Google Maps with high reliability.

### Get API Token
1.  Sign up or log in at [Apify](https://apify.com/).
2.  Go to **Settings** > **Integrations**.
3.  Copy your **Personal API Token**.

### Add Credential in 3X3CUT0R
1.  Open the 3X3CUT0R dashboard.
2.  Navigate to **Credentials** -> **Add New**.
3.  Select **APIFY** as the type.
4.  Paste your API Token and give it a name (e.g., "My Apify Token").

### Configure Node
1.  Add the **Apify Maps** node to your workflow.
2.  Select your Apify credential.
3.  Enter a **Search Query** (e.g., "Dental clinics in Berlin").
4.  Set **Max Results** (how many places to extract).

---

## 2. Google Sheets Configuration

You can now use Google Sheets as both a **Trigger** (when a row is added) and an **Action** (to add/update rows).

### Setup Google Cloud Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the **Google Sheets API**.
4.  Go to **APIs & Services** > **Credentials**.
5.  Create a **Service Account**.
6.  Click on the service account > **Keys** > **Add Key** > **Create New Key (JSON)**.
7.  Download the JSON file.

### Add Credential in 3X3CUT0R
1.  Navigate to **Credentials** -> **Add New**.
2.  Select **GOOGLE_SHEETS** as the type.
3.  Paste the contents of your JSON key file into the value field.

### Configure Trigger/Action
1.  **Spreadsheet ID**: Open your Google Sheet in the browser. The ID is the long string in the URL between `/d/` and `/edit` (e.g., `1aBcDe...`).
2.  **Sheet Name**: Usually `Sheet1` (check the tab name at the bottom).
3.  **Data to Append (Action)**: Use JSON format or variables, e.g., `{"Name": "{{name}}", "Email": "{{email}}"}`.

> [!IMPORTANT]
> Make sure to **Share** your Google Sheet with the Service Account email address (found in your JSON key) and give it **Editor** permissions.
