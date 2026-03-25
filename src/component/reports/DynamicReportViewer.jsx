import { useState, useEffect } from 'react';
import { REPORT_CONFIGS } from './reportConfigs';
import SmartDatatable from '../../datatable/SmartDatatable';
import { getReportData } from '../../service/dashboard.service';


const DynamicReportViewer = ({ reportId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const config = REPORT_CONFIGS[reportId];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

          const response = await getReportData(config.fetchUrl);
          const rawData = response.data || [];
          if(rawData.legnth === 0) {
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
  }, [reportId, config]);

  if (!config) return <div className="p-4">Select a valid report.</div>;
  if (loading) return <div className="text-center p-5">Loading report data...</div>;

  return (
    <SmartDatatable
      key={reportId}
      columns={config.columns} 
      data={data} 
      fileName={config.fileName}
      footer={config.renderFooter}
    />
  );
};

export default DynamicReportViewer;