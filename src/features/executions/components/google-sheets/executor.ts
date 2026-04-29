import { NodeExecutor } from "../../types";
import prisma from "@/lib/db";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import Handlebars from "handlebars";
import { decrypt } from "@/lib/encryption";

import { googleSheetsActionChannel } from "@/inngest/channels/google-sheets-action";

export const googleSheetsActionExecutor: NodeExecutor = async ({
  data,
  nodeId,
  userId,
  context,
  publish,
}) => {
  await publish(googleSheetsActionChannel().status({ nodeId, status: "loading" }));
  const { credentialId, spreadsheetId, sheetName, dataToAppend } = data as {
    credentialId: string;
    spreadsheetId: string;
    sheetName: string;
    dataToAppend: string;
  };

  const credential = await prisma.credential.findUniqueOrThrow({
    where: { id: credentialId, userId },
  });

  // Credential value should be the service account JSON
  const serviceAccountAuth = JSON.parse(decrypt(credential.value));

  const auth = new JWT({
    email: serviceAccountAuth.client_email,
    key: serviceAccountAuth.private_key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, auth);

  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByTitle[sheetName] || doc.sheetsByIndex[0];

    let rowsToAppend: any[] = [];

    // Improved logic: If dataToAppend is a simple variable like {{my_results}}, 
    // fetch the value directly from context to preserve its structure (array/object).
    const isSimpleVariable = /^\{\{([^}]+)\}\}$/.exec(dataToAppend.trim());
    
    if (isSimpleVariable) {
      const variableName = isSimpleVariable[1].trim();
      const value = context[variableName];
      if (Array.isArray(value)) {
        rowsToAppend = value;
      } else if (typeof value === 'object' && value !== null) {
        rowsToAppend = [value];
      } else {
        rowsToAppend = [{ [variableName]: value }];
      }
    } else {
      // Otherwise use Handlebars for complex templates
      const template = Handlebars.compile(dataToAppend);
      const templatedData = template(context);

      try {
        const parsed = JSON.parse(templatedData);
        if (Array.isArray(parsed)) {
          rowsToAppend = parsed;
        } else {
          rowsToAppend = [parsed];
        }
      } catch (e) {
        throw new Error("Data to append must be a valid JSON object or array of objects. Check your template.");
      }
    }

    if (rowsToAppend.length === 0) {
      await publish(googleSheetsActionChannel().status({ nodeId, status: "success" }));
      return {
        ...context,
        last_sheets_append: {
          spreadsheetId,
          sheetName,
          status: "success",
          count: 0,
          message: "No rows to append"
        }
      };
    }

    // --- Fix: Robust Header Handling ---
    let existingHeaders: string[] = [];
    try {
      await sheet.loadHeaderRow();
      existingHeaders = sheet.headerValues;
    } catch (e) {
      // Header row is empty or doesn't exist
    }

    if (existingHeaders.length === 0) {
      // Collect all unique keys from all rows to ensure complete headers
      const allKeys = new Set<string>();
      rowsToAppend.forEach(row => {
        Object.keys(row).forEach(key => allKeys.add(key));
      });
      const headers = Array.from(allKeys);
      
      if (headers.length > 0) {
        await sheet.setHeaderRow(headers);
      }
    }
    // ----------------------------------

    // Append rows
    await sheet.addRows(rowsToAppend);

    await publish(googleSheetsActionChannel().status({ nodeId, status: "success" }));
    return {
      ...context,
      last_sheets_append: {
        spreadsheetId,
        sheetName,
        status: "success",
        count: rowsToAppend.length,
      }
    };
  } catch (error: any) {
    console.error("Google Sheets Error:", error);
    await publish(googleSheetsActionChannel().status({ nodeId, status: "error" }));
    throw new Error(`Google Sheets failed: ${error.message}`);
  }
};
