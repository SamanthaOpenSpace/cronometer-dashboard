import { subDays } from "date-fns";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getBodyData, getFoodData, getNutritionData, getOverviewData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const startDate = subDays(new Date(), 30).toISOString().slice(0, 10);
  const endDate = new Date().toISOString().slice(0, 10);

  const [overview, nutrition, body, foods] = await Promise.all([
    getOverviewData(),
    getNutritionData(30),
    getBodyData(90),
    getFoodData(startDate, endDate)
  ]);

  return <DashboardView overview={overview} nutrition={nutrition} body={body} foods={foods} />;
}
