import { useState, useEffect } from "react";
import {
  ColumnDirective,
  ColumnsDirective,
  Edit,
  Filter,
  GridComponent,
  Inject,
  Page,
  Sort,
  Toolbar,
  VirtualScroll,
} from "@syncfusion/ej2-react-grids";
import "./style.scss";
import moment from "moment";

const Login = () => {
  const [data, setData] = useState([]);

  const pageSettings = {
    pageSize: 10,
    pageSizes: ["All", "10", "20", "50", "100"],
    pageCount: 5,
    currentPage: 1,
  };

  useEffect(() => {
    async function fetchData() {
      // Get the authorization token from localStorage
      const authToken = localStorage.getItem("auth");
  
      // Check if authToken is not null before using it in headers
      if (authToken !== null) {
        const synkHeaders: Record<string, string> = {
          Authorization: authToken,
          "X-Konami-Iop": "10000498", // Convert to string
          "X-Konami-Session-Timetoexpire": "1696852247174", // Convert to string
        };
  
        const response = await fetch(
          "https://feqa.kgisystems.com:1550/v1/system/devices/notes/types?limit=-1",
          {
            method: "GET",
            headers: synkHeaders,
          }
        );
  
        const result = await response.json();
        const dataObj = result?.deviceNoteTypes.map((item: any) => ({
          ...item,
          lastModDate: item?.lastModDate ? moment(item.lastModDate).format("YYYY-MM-DD") : item.lastModDate
        }))
        setData(dataObj)
      }
    }
  
    fetchData();
  }, []);
  

  return (
    <div>
      <div className={" e-adaptive-demo e-bigger"}>
        <div className={"e-mobile-layout"}>
          <div className={"e-mobile-content"}>
            <div className="grid-header">{"Device Setup"}</div>
            <GridComponent
              dataSource={data}
              allowPaging={true}
              pageSettings={pageSettings}
              allowSorting={true}
            >
              <ColumnsDirective>
                <ColumnDirective field="Description" />
                <ColumnDirective field="LastModBy" />
                <ColumnDirective field="LastModDate" />
              </ColumnsDirective>
              <Inject
                services={[Edit, Toolbar, Sort, Page, Filter, VirtualScroll]}
              />
            </GridComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
