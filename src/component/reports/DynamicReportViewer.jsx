import { useState, useEffect } from 'react';
import { REPORT_CONFIGS } from './reportConfigs';
import SmartDatatable from '../../datatable/SmartDatatable';
import { getReportData } from '../../service/dashboard.service';
import AnnualTrainingReportViewer from './AnnualTrainingReportViewer';
import BudgetExpenditureViewer from './BudgetExpenditureViewer';
import GenderBudgetingViewer from './GenderBudgetingViewer';
import TrainingSCSTViewer from './TrainingSCSTViewer';
import { format } from 'date-fns';


const DynamicReportViewer = ({ reportId, fromDate, toDate }) => {

  const formatFromDate = format(new Date(fromDate), 'yyyy-MM-dd');
  const formatToDate = format(new Date(toDate), 'yyyy-MM-dd');

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const config = REPORT_CONFIGS[reportId];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = config.fetchUrl;

        if (["2","3","4","5","6","7","8","10","11","14"].includes(reportId) && formatFromDate && formatToDate) {
          url = `${url}?fromDate=${formatFromDate}&toDate=${formatToDate}`;
        }
        const response = await getReportData(url);
        const rawData = response.data || [];
        if (rawData.length === 0) {
          setData([]);
          return;
        } else {
          const transformedData = rawData.map((item, index) => ({
            ...item,
            sn: index + 1,
          }));
          setData(transformedData || []);
        }

      } catch (error) {
        console.error("Failed to fetch report data", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (config) fetchData();
  }, [reportId, config, formatFromDate, formatToDate]);

  if (!config) return <div className="p-4">Select a valid report.</div>;
  if (loading) return <div className="text-center p-5">Loading report data...</div>;

  const renderReport = () => {
    switch (reportId) {
      case "8":
        return <AnnualTrainingReportViewer reportData={data} />;
      case "11":
        return <BudgetExpenditureViewer reportData={data} />;
      case "12":
        return <GenderBudgetingViewer reportData={data} />;
      case "13":
        return <TrainingSCSTViewer reportData={data} />;
      default:
        return (
          <SmartDatatable
            key={reportId}
            reportId={reportId}
            columns={config.columns}
            data={data}
            fileName={config.fileName}
            footer={config.renderFooter}
          />
        );
    }
  };

  return (
    <>
      {renderReport()}
    </>
  );
};

export default DynamicReportViewer;