import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth/helpers";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
  }

  try {
    const targetDir = path.join(process.cwd(), "public", "images", "reshamchikankari");

    if (!fs.existsSync(targetDir)) {
      return NextResponse.json({ error: "Directory not found: " + targetDir });
    }

    const folders = fs.readdirSync(targetDir).filter((file) => {
      return fs.statSync(path.join(targetDir, file)).isDirectory();
    });

    // Sort folders numerically
    folders.sort((a, b) => {
      const getNum = (str: string) => {
        const match = str.match(/\((\d+)\)/);
        return match ? parseInt(match[1], 10) : 1;
      };
      return getNum(a) - getNum(b);
    });

    const result = folders.map((folder) => {
      const folderPath = path.join(targetDir, folder);
      const files = fs.readdirSync(folderPath).filter((file) => {
        return !fs.statSync(path.join(folderPath, file)).isDirectory();
      });
      return {
        folder,
        count: files.length,
        files: files.slice(0, 10), // return up to 10 files
      };
    });

    return NextResponse.json({ foldersCount: result.length, folders: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
