

// // export default SuperAdminDashboard;
// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// const USERS_ENDPOINT = `${API_BASE}/users`;
// const REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;

// // ================================================================
// // ========== PRODUCT INVENTORY & REQUEST REPORT ==================
// // ==  (Super Admin ONLY — summary + PDF export, no tables on screen)
// // ================================================================
// const ProductInventoryReport = () => {
//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [departmentUsage, setDepartmentUsage] = useState({});

//   // Period filter
//   const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
//   const [quarterFilter, setQuarterFilter] = useState('ALL');

//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const REFRESH_INTERVAL = 15000;

//   useEffect(() => { fetchData(); }, []);

//   useEffect(() => {
//     if (!autoRefresh) return;
//     const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
//     return () => clearInterval(id);
//   }, [autoRefresh]);

//   const fetchData = async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);
//       setError('');
//       const [productRes, requestRes] = await Promise.all([
//         fetch(PRODUCTS_ENDPOINT),
//         fetch(REQUESTS_ENDPOINT),
//       ]);

//       if (!productRes.ok || !requestRes.ok) {
//         throw new Error('Failed to fetch data from API');
//       }

//       const productsData = await productRes.json();
//       const requestsData = await requestRes.json();

//       setRequests(requestsData);

//       // Map: productId -> request
//       const requestMap = new Map();
//       requestsData.forEach(req => {
//         if (req.product && req.product.productId) {
//           requestMap.set(req.product.productId, req);
//         }
//       });

//       const mergedData = productsData.map(prod => {
//         const req = requestMap.get(prod.productId);
//         const requestStatus = req?.status ?? 'AVAILABLE';

//         const stockStatus =
//           requestStatus === 'APPROVED'
//             ? 'Out of Stock'
//             : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

//         return {
//           ...prod,
//           // ✅ product table values (kept separate)
//           productQuantity: prod.productQuantity ?? '0',
//           receiptVoucherNo: prod.receiptVoucherNo ?? '-',
//           supplierName: prod.supplierName ?? '-',
//           balance: prod.balance ?? '-',
//           // ✅ request values
//           requestQuantity: req?.quantity ?? '-',
//           description: req?.description ?? '-',
//           adminNote: req?.adminNote ?? '-',
//           status: requestStatus,
//           departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
//           productDescription: prod.productDescription ?? '-',
//           stockStatus,
//           requestedProductName: req?.product?.productName ?? '-',
//         };
//       });

//       setProducts(mergedData);
//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error(err);
//       if (!silent) setError('Failed to load data.');
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   const getQuarter = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return Math.floor(d.getMonth() / 3) + 1;
//   };
//   const getYear = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getFullYear();
//   };
//   const getFilterDate = (item) => item.receiptDate || item.issueDate || null;

//   const years = useMemo(() => {
//     const currentYear = new Date().getFullYear();
//     return Array.from({ length: 6 }, (_, i) => currentYear - i);
//   }, []);

//   const matchesPeriod = (item) => {
//     const d = getFilterDate(item);
//     if (!d) return yearFilter === 'ALL' && quarterFilter === 'ALL';
//     if (yearFilter !== 'ALL' && getYear(d) !== Number(yearFilter)) return false;
//     if (quarterFilter !== 'ALL' && getQuarter(d) !== Number(quarterFilter)) return false;
//     return true;
//   };

//   const periodProducts = useMemo(
//     () => products.filter(matchesPeriod),
//     [products, yearFilter, quarterFilter]
//   );

//   const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
//   const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

//   // Department usage (PDF only)
//   useEffect(() => {
//     const deptDetails = {};
//     requests.forEach(req => {
//       if (req.status !== 'APPROVED' && req.status !== 'REJECTED') return;
//       const linkedProduct = products.find(p => p.productId === req?.product?.productId);
//       const dateStr =
//         req.receiptDate ||
//         req.issueDate ||
//         linkedProduct?.receiptDate ||
//         linkedProduct?.issueDate;

//       const y = getYear(dateStr);
//       const q = getQuarter(dateStr);

//       if (yearFilter !== 'ALL' && y !== Number(yearFilter)) return;
//       if (quarterFilter !== 'ALL' && q !== Number(quarterFilter)) return;

//       const dept = req.departmentName || 'Unknown';
//       const productName = req?.product?.productName ?? '-';
//       const qty = Number(req.quantity) || 0;
//       if (!deptDetails[dept]) deptDetails[dept] = [];
//       deptDetails[dept].push({ productName, qty, status: req.status });
//     });
//     setDepartmentUsage(deptDetails);
//   }, [requests, products, yearFilter, quarterFilter]);

//   // ============ PDF EXPORT ============
//   const exportToPDF = () => {
//     const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const marginLeft = 25;
//     const marginRight = 25;
//     const tableWidth = pageWidth - marginLeft - marginRight;

//     doc.setFontSize(16);
//     doc.setTextColor(15, 23, 42);
//     doc.text('Product Inventory & Request Report', marginLeft, 40);

//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

//     const periodText =
//       yearFilter === 'ALL' && quarterFilter === 'ALL'
//         ? 'All Time'
//         : `${yearFilter === 'ALL' ? 'All Years' : yearFilter} — ${
//             quarterFilter === 'ALL' ? 'All Quarters' : `Q${quarterFilter}`
//           }`;
//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`Report Period: ${periodText}`, marginLeft, 70);
//     doc.setFont('helvetica', 'normal');

//     let y = 84;

//     // Summary cards
//     const cardY = y + 4;
//     const cardHeight = 34;
//     const cardGap = 10;
//     const cardWidth = (tableWidth - cardGap * 2) / 3;

//     doc.setFillColor(220, 252, 231);
//     doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(22, 101, 52);
//     doc.setFontSize(9);
//     doc.text('In Stock', marginLeft + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(254, 226, 226);
//     doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(185, 28, 28);
//     doc.setFontSize(9);
//     doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(219, 234, 254);
//     doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(30, 64, 175);
//     doc.setFontSize(9);
//     doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(periodProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     y = cardY + cardHeight + 20;

//     // ===== Department-wise Usage =====
//     const deptKeys = Object.keys(departmentUsage);
//     if (deptKeys.length > 0) {
//       doc.setFontSize(12);
//       doc.setTextColor(30, 64, 175);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Department-wise Usage (Approved / Rejected)', marginLeft, y);
//       doc.setFont('helvetica', 'normal');
//       y += 10;

//       const body = [];
//       deptKeys.forEach(dept => {
//         const items = departmentUsage[dept];
//         const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//         const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

//         body.push([
//           {
//             content: dept,
//             rowSpan: items.length + 1,
//             styles: {
//               valign: 'middle', halign: 'left', fontStyle: 'bold',
//               textColor: [15, 23, 42], fillColor: [241, 245, 249]
//             }
//           },
//           { content: `Total Requests: ${items.length}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [30, 64, 175], fillColor: [219, 234, 254] } },
//           { content: `Approved: ${approvedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [22, 101, 52], fillColor: [220, 252, 231] } },
//           { content: `Rejected: ${rejectedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }
//         ]);

//         items.forEach(item => {
//           body.push([
//             { content: item.productName, styles: { halign: 'left' } },
//             { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
//             {
//               content: item.status,
//               styles: {
//                 halign: 'center', fontStyle: 'bold',
//                 textColor: item.status === 'APPROVED' ? [22, 101, 52] : [185, 28, 28],
//                 fillColor: item.status === 'APPROVED' ? [240, 253, 244] : [254, 242, 242]
//               }
//             }
//           ]);
//         });
//       });

//       autoTable(doc, {
//         startY: y + 4,
//         head: [['Department', 'Product Name', 'Quantity', 'Status']],
//         body,
//         theme: 'grid',
//         styles: { fontSize: 9, cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, overflow: 'linebreak', valign: 'middle', lineColor: [203, 213, 225], lineWidth: 0.5, textColor: [30, 41, 59] },
//         headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
//         bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
//         tableWidth: tableWidth,
//         columnStyles: {
//           0: { cellWidth: 160, halign: 'left' },
//           1: { cellWidth: 'auto', halign: 'left' },
//           2: { cellWidth: 100, halign: 'center' },
//           3: { cellWidth: 100, halign: 'center' }
//         },
//         margin: { left: marginLeft, right: marginRight }
//       });

//       y = doc.lastAutoTable.finalY + 24;
//     }

//     // ===== Product Details — ✅ FULL COLUMN SET =====
//     doc.setFontSize(12);
//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Product Details', marginLeft, y);
//     doc.setFont('helvetica', 'normal');
//     y += 10;

//     autoTable(doc, {
//       startY: y + 4,
//       tableWidth: tableWidth,
//       theme: 'grid',
//       head: [[
//         'Product Name',
//         'Description',
//         'Product Qty',
//         'Req Qty',
//         'Department',
//         'Supplier',
//         'Voucher No',
//         'Price',
//         'Balance',
//         'Receipt Date',
//         'Issue Date',
//         'Staff Desc',
//         'Admin Note',
//         'Status',
//         'Stock Status'
//       ]],
//       body: periodProducts.map(p => [
//         p.productName ?? '-',
//         p.productDescription ?? '-',
//         { content: p.productQuantity ?? '0', styles: { halign: 'center', fontStyle: 'bold' } },
//         { content: p.requestQuantity ?? '-', styles: { halign: 'center' } },
//         p.departmentName ?? '-',
//         p.supplierName ?? '-',
//         p.receiptVoucherNo ?? '-',
//         { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
//         { content: p.issueDate ?? '-', styles: { halign: 'center' } },
//         p.description ?? '-',
//         p.adminNote ?? '-',
//         p.status ?? '-',
//         p.stockStatus ?? '-'
//       ]),
//       styles: {
//         fontSize: 7,
//         cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
//         overflow: 'linebreak',
//         valign: 'middle',
//         lineColor: [226, 232, 240],
//         lineWidth: 0.5,
//         textColor: [30, 41, 59]
//       },
//       headStyles: {
//         fillColor: [30, 64, 175],
//         textColor: 255,
//         fontStyle: 'bold',
//         halign: 'center',
//         valign: 'middle',
//         fontSize: 7
//       },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       columnStyles: {
//         0:  { cellWidth: 58, halign: 'left', fontStyle: 'bold' }, // Product Name
//         1:  { cellWidth: 70, halign: 'left' },                     // Description
//         2:  { cellWidth: 50, halign: 'center' },                   // Product Qty
//         3:  { cellWidth: 40, halign: 'center' },                   // Req Qty
//         4:  { cellWidth: 55, halign: 'left' },                     // Department
//         5:  { cellWidth: 55, halign: 'left' },                     // Supplier
//         6:  { cellWidth: 55, halign: 'left' },                     // Voucher No
//         7:  { cellWidth: 38, halign: 'right' },                    // Price
//         8:  { cellWidth: 38, halign: 'right' },                    // Balance
//         9:  { cellWidth: 55, halign: 'center' },                   // Receipt Date
//         10: { cellWidth: 48, halign: 'center' },                   // Issue Date
//         11: { cellWidth: 65, halign: 'left' },                     // Staff Desc
//         12: { cellWidth: 65, halign: 'left' },                     // Admin Note
//         13: { cellWidth: 48, halign: 'center' },                   // Status
//         14: { cellWidth: 50, halign: 'center' }                    // Stock Status
//       },
//       margin: { left: marginLeft, right: marginRight },
//       didParseCell: (data) => {
//         if (data.section === 'body') {
//           if (data.column.index === 13) {
//             const v = data.cell.raw;
//             if (v === 'APPROVED') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fillColor = [240, 253, 244];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'REJECTED') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fillColor = [254, 242, 242];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'PENDING') {
//               data.cell.styles.textColor = [146, 64, 14];
//               data.cell.styles.fillColor = [255, 251, 235];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'CHECKED') {
//               data.cell.styles.textColor = [109, 40, 217];
//               data.cell.styles.fillColor = [237, 233, 254];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'COMPLETED') {
//               data.cell.styles.textColor = [30, 64, 175];
//               data.cell.styles.fillColor = [219, 234, 254];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//           if (data.column.index === 14) {
//             const v = data.cell.raw;
//             if (v === 'In Stock') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'Out of Stock') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//         }
//       }
//     });

//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.setTextColor(120);
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.text(`Product Inventory & Request Report — ${periodText}`, marginLeft, pageHeight - 20);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
//     }

//     const periodTag =
//       (yearFilter === 'ALL' ? 'AllYears' : yearFilter) + '_' +
//       (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter);
//     doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   return (
//     <div>
//       {/* Top bar */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
//         <button
//           onClick={exportToPDF}
//           style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
//         >
//           Export to PDF
//         </button>

//         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
//           <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
//           Auto-refresh (15s)
//         </label>

//         {lastUpdated && (
//           <span style={{ fontSize: '12px', color: '#64748b' }}>
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//       </div>

//       {/* Period filter */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
//         <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>Report Period:</strong>
//         <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Years</option>
//           {years.map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//         <select value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Quarters</option>
//           <option value="1">Q1 (Jan – Mar)</option>
//           <option value="2">Q2 (Apr – Jun)</option>
//           <option value="3">Q3 (Jul – Sep)</option>
//           <option value="4">Q4 (Oct – Dec)</option>
//         </select>
//         <button
//           onClick={() => { setYearFilter(String(new Date().getFullYear())); setQuarterFilter('ALL'); }}
//           style={{ padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
//         >
//           This Year
//         </button>
//       </div>

//       {/* Summary cards only */}
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#1e40af' }}>Total Rows</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#1e40af' }}>{periodProducts.length}</p>
//           </div>
//         </div>
//       )}

//       {/* No tables on screen — they live in the exported PDF */}
//     </div>
//   );
// };

// // ================================================================
// // ==================== SUPER ADMIN DASHBOARD =====================
// // ================================================================
// const SuperAdminDashboard = () => {
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');
//   const [reportKind, setReportKind] = useState('products');

//   const [showInventoryReport, setShowInventoryReport] = useState(false);

//   const generateProductsPdf = (products) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('All Products Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Name', dataKey: 'name' },
//       { header: 'Description', dataKey: 'description' },
//       { header: 'Quantity', dataKey: 'quantity' },
//       { header: 'Unit Price', dataKey: 'unitPrice' },
//       { header: 'Supplier', dataKey: 'supplier' },
//       { header: 'Receipt Date', dataKey: 'receiptDate' },
//       { header: 'Issue Date', dataKey: 'issueDate' },
//     ];
//     const rows = products.map((p) => ({
//       id: p.productId ?? '', name: p.productName ?? '', description: p.productDescription ?? '',
//       quantity: p.productQuantity ?? '', unitPrice: p.price ?? '', supplier: p.supplierName ?? '',
//       receiptDate: p.receiptDate ?? '', issueDate: p.issueDate ?? '',
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`products-report-${Date.now()}.pdf`);
//   };

//   const generateProductsExcel = (products) => {
//     const data = products.map((p) => ({
//       ID: p.productId ?? '', Name: p.productName ?? '', Description: p.productDescription ?? '',
//       Quantity: p.productQuantity ?? '', 'Unit Price': p.price ?? '', Supplier: p.supplierName ?? '',
//       'Receipt Date': p.receiptDate ?? '', 'Issue Date': p.issueDate ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
//   };

//   const generateUsersPdf = (userList) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('System Users Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Username', dataKey: 'username' },
//       { header: 'Email', dataKey: 'email' },
//       { header: 'Gender', dataKey: 'gender' },
//       { header: 'Phone', dataKey: 'phone' },
//       { header: 'Role', dataKey: 'role' },
//       { header: 'Department', dataKey: 'department' },
//     ];
//     const rows = userList.map((u) => ({
//       id: u.userId ?? u.id ?? '', username: u.userName ?? u.username ?? u.name ?? '',
//       email: u.email ?? '', gender: u.gender ?? '', phone: u.phoneNumber ?? u.phone ?? '',
//       role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [245, 243, 255] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`users-report-${Date.now()}.pdf`);
//   };

//   const generateUsersExcel = (userList) => {
//     const data = userList.map((u) => ({
//       ID: u.userId ?? u.id ?? '', Username: u.userName ?? u.username ?? u.name ?? '',
//       Email: u.email ?? '', Gender: u.gender ?? '', Phone: u.phoneNumber ?? u.phone ?? '',
//       Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       Department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 20 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
//     XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
//   };

//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');
//     try {
//       const isUsers = reportKind === 'users';
//       const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
//       const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } });

//       if (!response.ok) {
//         let errorMsg = `Server responded with ${response.status}`;
//         try { const errText = await response.text(); if (errText) errorMsg = errText; } catch (_) {}
//         throw new Error(errorMsg);
//       }

//       const data = await response.json();
//       if (!Array.isArray(data) || data.length === 0) throw new Error('No data available to export.');

//       if (isUsers) {
//         if (type === 'pdf') generateUsersPdf(data); else generateUsersExcel(data);
//       } else {
//         if (type === 'pdf') generateProductsPdf(data); else generateProductsExcel(data);
//       }
//       setShowReportOptions(false);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       setReportError(
//         error.message === 'Failed to fetch'
//           ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
//           : error.message
//       );
//     } finally {
//       setDownloadingType(null);
//     }
//   };

//   const cards = [
//     {
//       title: 'All Products Report',
//       icon: '📦',
//       description: 'Download a full report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
//     },
//     {
//       title: 'System Users',
//       icon: '👥',
//       description: 'Download a report of all registered users across every department.',
//       color: '#8b5cf6',
//       actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
//     },
//     {
//       title: 'Product Inventory & Request Report',
//       icon: '📊',
//       description: 'Pick a period and export the full inventory PDF report.',
//       color: '#0ea5e9',
//       actions: [{ label: 'Open Inventory Report', type: 'inventory' }],
//     },
//   ];

//   const handleAction = (action) => {
//     if (action.type === 'report') {
//       setReportError('');
//       setReportKind(action.kind || 'products');
//       setShowReportOptions(true);
//     } else if (action.type === 'inventory') {
//       setShowInventoryReport(true);
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   const modalOverlay = {
//     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
//     alignItems: 'center', justifyContent: 'center', zIndex: 1000,
//   };
//   const modalContent = {
//     backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
//     maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//   };
//   const closeButton = {
//     marginTop: '20px', padding: '10px 24px', border: 'none', borderRadius: '7px',
//     backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '14px',
//     fontWeight: '600', cursor: 'pointer',
//   };

//   const isUsersReport = reportKind === 'users';
//   const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
//   const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

//   return (
//     <div style={{ padding: '30px' }}>
//       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
//         Welcome, Super Admin — Full System Control
//       </p>

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
//         {cards.map((card) => (
//           <div
//             key={card.title}
//             style={{
//               backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
//               border: '1px solid #e2e8f0', borderLeft: `5px solid ${card.color}`,
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease',
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'; }}
//             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
//           >
//             <div style={{ width: '55px', height: '55px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '18px' }}>
//               {card.icon}
//             </div>
//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>{card.title}</h2>
//             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.description}</p>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{ width: '100%', padding: '11px 15px', border: 'none', borderRadius: '7px', backgroundColor: card.color, color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
//                 >
//                   {action.label} →
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {showInventoryReport && (
//         <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//             <h2 style={{ margin: 0, color: '#0f172a' }}>Product Inventory & Request Report</h2>
//             <button
//               onClick={() => setShowInventoryReport(false)}
//               style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
//             >
//               Close ✕
//             </button>
//           </div>
//           <ProductInventoryReport />
//         </div>
//       )}

//       {showReportOptions && (
//         <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose the format you want to download:</p>

//             {reportError && (
//               <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'pdf' ? '#f87171' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'excel' ? '#4ade80' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
//                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
//               </button>
//             </div>

//             <div style={{ textAlign: 'right' }}>
//               <button style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }} onClick={() => setShowReportOptions(false)} disabled={!!downloadingType}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const selectStyle = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' };

// export default SuperAdminDashboard;

// export default SuperAdminDashboard;
// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// const USERS_ENDPOINT = `${API_BASE}/users`;
// const REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;

// // ================================================================
// // ========== PRODUCT INVENTORY & REQUEST REPORT ==================
// // ==  (Super Admin ONLY — summary + PDF export, no tables on screen)
// // ================================================================
// const ProductInventoryReport = () => {
//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [departmentUsage, setDepartmentUsage] = useState({});

//   // Period filter
//   const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
//   const [quarterFilter, setQuarterFilter] = useState('ALL');
//   const [monthFilter, setMonthFilter] = useState('ALL'); // ✅ NEW

//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const REFRESH_INTERVAL = 15000;

//   useEffect(() => { fetchData(); }, []);

//   useEffect(() => {
//     if (!autoRefresh) return;
//     const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
//     return () => clearInterval(id);
//   }, [autoRefresh]);

//   const fetchData = async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);
//       setError('');
//       const [productRes, requestRes] = await Promise.all([
//         fetch(PRODUCTS_ENDPOINT),
//         fetch(REQUESTS_ENDPOINT),
//       ]);

//       if (!productRes.ok || !requestRes.ok) {
//         throw new Error('Failed to fetch data from API');
//       }

//       const productsData = await productRes.json();
//       const requestsData = await requestRes.json();

//       setRequests(requestsData);

//       // Map: productId -> request
//       const requestMap = new Map();
//       requestsData.forEach(req => {
//         if (req.product && req.product.productId) {
//           requestMap.set(req.product.productId, req);
//         }
//       });

//       const mergedData = productsData.map(prod => {
//         const req = requestMap.get(prod.productId);
//         const requestStatus = req?.status ?? 'AVAILABLE';

//         const stockStatus =
//           requestStatus === 'APPROVED'
//             ? 'Out of Stock'
//             : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

//         return {
//           ...prod,
//           // ✅ product table values (kept separate)
//           productQuantity: prod.productQuantity ?? '0',
//           receiptVoucherNo: prod.receiptVoucherNo ?? '-',
//           supplierName: prod.supplierName ?? '-',
//           balance: prod.balance ?? '-',
//           // ✅ request values
//           requestQuantity: req?.quantity ?? '-',
//           description: req?.description ?? '-',
//           adminNote: req?.adminNote ?? '-',
//           status: requestStatus,
//           departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
//           productDescription: prod.productDescription ?? '-',
//           stockStatus,
//           requestedProductName: req?.product?.productName ?? '-',
//         };
//       });

//       setProducts(mergedData);
//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error(err);
//       if (!silent) setError('Failed to load data.');
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   const getQuarter = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return Math.floor(d.getMonth() / 3) + 1;
//   };
//   const getMonth = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getMonth() + 1; // 1-12
//   };
//   const getYear = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getFullYear();
//   };
//   const getFilterDate = (item) => item.receiptDate || item.issueDate || null;

//   const years = useMemo(() => {
//     const currentYear = new Date().getFullYear();
//     return Array.from({ length: 6 }, (_, i) => currentYear - i);
//   }, []);

//   const matchesPeriod = (item) => {
//     const d = getFilterDate(item);
//     if (!d) {
//       return yearFilter === 'ALL' && quarterFilter === 'ALL' && monthFilter === 'ALL';
//     }
//     if (yearFilter !== 'ALL' && getYear(d) !== Number(yearFilter)) return false;
//     if (quarterFilter !== 'ALL' && getQuarter(d) !== Number(quarterFilter)) return false;
//     if (monthFilter !== 'ALL' && getMonth(d) !== Number(monthFilter)) return false;
//     return true;
//   };

//   const periodProducts = useMemo(
//     () => products.filter(matchesPeriod),
//     [products, yearFilter, quarterFilter, monthFilter]
//   );

//   const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
//   const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

//   // Department usage (PDF only)
//   useEffect(() => {
//     const deptDetails = {};
//     requests.forEach(req => {
//       if (req.status !== 'APPROVED' && req.status !== 'REJECTED') return;
//       const linkedProduct = products.find(p => p.productId === req?.product?.productId);
//       const dateStr =
//         req.receiptDate ||
//         req.issueDate ||
//         linkedProduct?.receiptDate ||
//         linkedProduct?.issueDate;

//       const y = getYear(dateStr);
//       const q = getQuarter(dateStr);
//       const m = getMonth(dateStr);

//       if (yearFilter !== 'ALL' && y !== Number(yearFilter)) return;
//       if (quarterFilter !== 'ALL' && q !== Number(quarterFilter)) return;
//       if (monthFilter !== 'ALL' && m !== Number(monthFilter)) return;

//       const dept = req.departmentName || 'Unknown';
//       const productName = req?.product?.productName ?? '-';
//       const qty = Number(req.quantity) || 0;
//       if (!deptDetails[dept]) deptDetails[dept] = [];
//       deptDetails[dept].push({ productName, qty, status: req.status });
//     });
//     setDepartmentUsage(deptDetails);
//   }, [requests, products, yearFilter, quarterFilter, monthFilter]);

//   // ============ PDF EXPORT ============
//   const exportToPDF = () => {
//     const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const marginLeft = 25;
//     const marginRight = 25;
//     const tableWidth = pageWidth - marginLeft - marginRight;

//     doc.setFontSize(16);
//     doc.setTextColor(15, 23, 42);
//     doc.text('Product Inventory & Request Report', marginLeft, 40);

//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

//     // Build readable period string that includes month when set
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];

//     const parts = [];
//     parts.push(yearFilter === 'ALL' ? 'All Years' : String(yearFilter));
//     if (quarterFilter !== 'ALL') parts.push(`Q${quarterFilter}`);
//     if (monthFilter !== 'ALL') parts.push(monthNames[Number(monthFilter) - 1]);
//     const periodText = parts.join(' — ');

//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`Report Period: ${periodText}`, marginLeft, 70);
//     doc.setFont('helvetica', 'normal');

//     let y = 84;

//     // Summary cards
//     const cardY = y + 4;
//     const cardHeight = 34;
//     const cardGap = 10;
//     const cardWidth = (tableWidth - cardGap * 2) / 3;

//     doc.setFillColor(220, 252, 231);
//     doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(22, 101, 52);
//     doc.setFontSize(9);
//     doc.text('In Stock', marginLeft + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(254, 226, 226);
//     doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(185, 28, 28);
//     doc.setFontSize(9);
//     doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(219, 234, 254);
//     doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(30, 64, 175);
//     doc.setFontSize(9);
//     doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(periodProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     y = cardY + cardHeight + 20;

//     // ===== Department-wise Usage =====
//     const deptKeys = Object.keys(departmentUsage);
//     if (deptKeys.length > 0) {
//       doc.setFontSize(12);
//       doc.setTextColor(30, 64, 175);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Department-wise Usage (Approved / Rejected)', marginLeft, y);
//       doc.setFont('helvetica', 'normal');
//       y += 10;

//       const body = [];
//       deptKeys.forEach(dept => {
//         const items = departmentUsage[dept];
//         const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//         const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

//         body.push([
//           {
//             content: dept,
//             rowSpan: items.length + 1,
//             styles: {
//               valign: 'middle', halign: 'left', fontStyle: 'bold',
//               textColor: [15, 23, 42], fillColor: [241, 245, 249]
//             }
//           },
//           { content: `Total Requests: ${items.length}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [30, 64, 175], fillColor: [219, 234, 254] } },
//           { content: `Approved: ${approvedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [22, 101, 52], fillColor: [220, 252, 231] } },
//           { content: `Rejected: ${rejectedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }
//         ]);

//         items.forEach(item => {
//           body.push([
//             { content: item.productName, styles: { halign: 'left' } },
//             { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
//             {
//               content: item.status,
//               styles: {
//                 halign: 'center', fontStyle: 'bold',
//                 textColor: item.status === 'APPROVED' ? [22, 101, 52] : [185, 28, 28],
//                 fillColor: item.status === 'APPROVED' ? [240, 253, 244] : [254, 242, 242]
//               }
//             }
//           ]);
//         });
//       });

//       autoTable(doc, {
//         startY: y + 4,
//         head: [['Department', 'Product Name', 'Quantity', 'Status']],
//         body,
//         theme: 'grid',
//         styles: { fontSize: 9, cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, overflow: 'linebreak', valign: 'middle', lineColor: [203, 213, 225], lineWidth: 0.5, textColor: [30, 41, 59] },
//         headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
//         bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
//         tableWidth: tableWidth,
//         columnStyles: {
//           0: { cellWidth: 160, halign: 'left' },
//           1: { cellWidth: 'auto', halign: 'left' },
//           2: { cellWidth: 100, halign: 'center' },
//           3: { cellWidth: 100, halign: 'center' }
//         },
//         margin: { left: marginLeft, right: marginRight }
//       });

//       y = doc.lastAutoTable.finalY + 24;
//     }

//     // ===== Product Details — ✅ FULL COLUMN SET =====
//     doc.setFontSize(12);
//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Product Details', marginLeft, y);
//     doc.setFont('helvetica', 'normal');
//     y += 10;

//     autoTable(doc, {
//       startY: y + 4,
//       tableWidth: tableWidth,
//       theme: 'grid',
//       head: [[
//         'Product Name',
//         'Description',
//         'Product Qty',
//         'Req Qty',
//         'Department',
//         'Supplier',
//         'Voucher No',
//         'Price',
//         'Balance',
//         'Receipt Date',
//         'Issue Date',
//         'Staff Desc',
//         'Admin Note',
//         'Status',
//         'Stock Status'
//       ]],
//       body: periodProducts.map(p => [
//         p.productName ?? '-',
//         p.productDescription ?? '-',
//         { content: p.productQuantity ?? '0', styles: { halign: 'center', fontStyle: 'bold' } },
//         { content: p.requestQuantity ?? '-', styles: { halign: 'center' } },
//         p.departmentName ?? '-',
//         p.supplierName ?? '-',
//         p.receiptVoucherNo ?? '-',
//         { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
//         { content: p.issueDate ?? '-', styles: { halign: 'center' } },
//         p.description ?? '-',
//         p.adminNote ?? '-',
//         p.status ?? '-',
//         p.stockStatus ?? '-'
//       ]),
//       styles: {
//         fontSize: 7,
//         cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
//         overflow: 'linebreak',
//         valign: 'middle',
//         lineColor: [226, 232, 240],
//         lineWidth: 0.5,
//         textColor: [30, 41, 59]
//       },
//       headStyles: {
//         fillColor: [30, 64, 175],
//         textColor: 255,
//         fontStyle: 'bold',
//         halign: 'center',
//         valign: 'middle',
//         fontSize: 7
//       },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       columnStyles: {
//         0:  { cellWidth: 58, halign: 'left', fontStyle: 'bold' }, // Product Name
//         1:  { cellWidth: 70, halign: 'left' },                     // Description
//         2:  { cellWidth: 50, halign: 'center' },                   // Product Qty
//         3:  { cellWidth: 40, halign: 'center' },                   // Req Qty
//         4:  { cellWidth: 55, halign: 'left' },                     // Department
//         5:  { cellWidth: 55, halign: 'left' },                     // Supplier
//         6:  { cellWidth: 55, halign: 'left' },                     // Voucher No
//         7:  { cellWidth: 38, halign: 'right' },                    // Price
//         8:  { cellWidth: 38, halign: 'right' },                    // Balance
//         9:  { cellWidth: 55, halign: 'center' },                   // Receipt Date
//         10: { cellWidth: 48, halign: 'center' },                   // Issue Date
//         11: { cellWidth: 65, halign: 'left' },                     // Staff Desc
//         12: { cellWidth: 65, halign: 'left' },                     // Admin Note
//         13: { cellWidth: 48, halign: 'center' },                   // Status
//         14: { cellWidth: 50, halign: 'center' }                    // Stock Status
//       },
//       margin: { left: marginLeft, right: marginRight },
//       didParseCell: (data) => {
//         if (data.section === 'body') {
//           if (data.column.index === 13) {
//             const v = data.cell.raw;
//             if (v === 'APPROVED') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fillColor = [240, 253, 244];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'REJECTED') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fillColor = [254, 242, 242];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'PENDING') {
//               data.cell.styles.textColor = [146, 64, 14];
//               data.cell.styles.fillColor = [255, 251, 235];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'CHECKED') {
//               data.cell.styles.textColor = [109, 40, 217];
//               data.cell.styles.fillColor = [237, 233, 254];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'COMPLETED') {
//               data.cell.styles.textColor = [30, 64, 175];
//               data.cell.styles.fillColor = [219, 234, 254];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//           if (data.column.index === 14) {
//             const v = data.cell.raw;
//             if (v === 'In Stock') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'Out of Stock') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//         }
//       }
//     });

//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.setTextColor(120);
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.text(`Product Inventory & Request Report — ${periodText}`, marginLeft, pageHeight - 20);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
//     }

//     const periodTag =
//       (yearFilter === 'ALL' ? 'AllYears' : yearFilter) + '_' +
//       (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter) + '_' +
//       (monthFilter === 'ALL' ? 'AllM' : 'M' + monthFilter);
//     doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   return (
//     <div>
//       {/* Top bar */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
//         <button
//           onClick={exportToPDF}
//           style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
//         >
//           Export to PDF
//         </button>

//         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
//           <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
//           Auto-refresh (15s)
//         </label>

//         {lastUpdated && (
//           <span style={{ fontSize: '12px', color: '#64748b' }}>
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//       </div>

//       {/* Period filter */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
//         <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>Report Period:</strong>
//         <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Years</option>
//           {years.map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//         <select value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Quarters</option>
//           <option value="1">Q1 (Jan – Mar)</option>
//           <option value="2">Q2 (Apr – Jun)</option>
//           <option value="3">Q3 (Jul – Sep)</option>
//           <option value="4">Q4 (Oct – Dec)</option>
//         </select>

//         {/* ✅ NEW: Month selector */}
//         <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Months</option>
//           <option value="1">January</option>
//           <option value="2">February</option>
//           <option value="3">March</option>
//           <option value="4">April</option>
//           <option value="5">May</option>
//           <option value="6">June</option>
//           <option value="7">July</option>
//           <option value="8">August</option>
//           <option value="9">September</option>
//           <option value="10">October</option>
//           <option value="11">November</option>
//           <option value="12">December</option>
//         </select>

//         <button
//           onClick={() => { setYearFilter(String(new Date().getFullYear())); setQuarterFilter('ALL'); setMonthFilter('ALL'); }}
//           style={{ padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
//         >
//           This Year
//         </button>
//       </div>

//       {/* Summary cards only */}
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#1e40af' }}>Total Rows</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#1e40af' }}>{periodProducts.length}</p>
//           </div>
//         </div>
//       )}

//       {/* No tables on screen — they live in the exported PDF */}
//     </div>
//   );
// };

// // ================================================================
// // ==================== SUPER ADMIN DASHBOARD =====================
// // ================================================================
// const SuperAdminDashboard = () => {
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');
//   const [reportKind, setReportKind] = useState('products');

//   const [showInventoryReport, setShowInventoryReport] = useState(false);

//   const generateProductsPdf = (products) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('All Products Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Name', dataKey: 'name' },
//       { header: 'Description', dataKey: 'description' },
//       { header: 'Quantity', dataKey: 'quantity' },
//       { header: 'Unit Price', dataKey: 'unitPrice' },
//       { header: 'Supplier', dataKey: 'supplier' },
//       { header: 'Receipt Date', dataKey: 'receiptDate' },
//       { header: 'Issue Date', dataKey: 'issueDate' },
//     ];
//     const rows = products.map((p) => ({
//       id: p.productId ?? '', name: p.productName ?? '', description: p.productDescription ?? '',
//       quantity: p.productQuantity ?? '', unitPrice: p.price ?? '', supplier: p.supplierName ?? '',
//       receiptDate: p.receiptDate ?? '', issueDate: p.issueDate ?? '',
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`products-report-${Date.now()}.pdf`);
//   };

//   const generateProductsExcel = (products) => {
//     const data = products.map((p) => ({
//       ID: p.productId ?? '', Name: p.productName ?? '', Description: p.productDescription ?? '',
//       Quantity: p.productQuantity ?? '', 'Unit Price': p.price ?? '', Supplier: p.supplierName ?? '',
//       'Receipt Date': p.receiptDate ?? '', 'Issue Date': p.issueDate ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
//   };

//   const generateUsersPdf = (userList) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('System Users Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Username', dataKey: 'username' },
//       { header: 'Email', dataKey: 'email' },
//       { header: 'Gender', dataKey: 'gender' },
//       { header: 'Phone', dataKey: 'phone' },
//       { header: 'Role', dataKey: 'role' },
//       { header: 'Department', dataKey: 'department' },
//     ];
//     const rows = userList.map((u) => ({
//       id: u.userId ?? u.id ?? '', username: u.userName ?? u.username ?? u.name ?? '',
//       email: u.email ?? '', gender: u.gender ?? '', phone: u.phoneNumber ?? u.phone ?? '',
//       role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [245, 243, 255] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`users-report-${Date.now()}.pdf`);
//   };

//   const generateUsersExcel = (userList) => {
//     const data = userList.map((u) => ({
//       ID: u.userId ?? u.id ?? '', Username: u.userName ?? u.username ?? u.name ?? '',
//       Email: u.email ?? '', Gender: u.gender ?? '', Phone: u.phoneNumber ?? u.phone ?? '',
//       Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       Department: u.department?.departmentName ?? u.department?.name ?? u.department ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 20 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
//     XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
//   };

//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');
//     try {
//       const isUsers = reportKind === 'users';
//       const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
//       const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } });

//       if (!response.ok) {
//         let errorMsg = `Server responded with ${response.status}`;
//         try { const errText = await response.text(); if (errText) errorMsg = errText; } catch (_) {}
//         throw new Error(errorMsg);
//       }

//       const data = await response.json();
//       if (!Array.isArray(data) || data.length === 0) throw new Error('No data available to export.');

//       if (isUsers) {
//         if (type === 'pdf') generateUsersPdf(data); else generateUsersExcel(data);
//       } else {
//         if (type === 'pdf') generateProductsPdf(data); else generateProductsExcel(data);
//       }
//       setShowReportOptions(false);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       setReportError(
//         error.message === 'Failed to fetch'
//           ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
//           : error.message
//       );
//     } finally {
//       setDownloadingType(null);
//     }
//   };

//   const cards = [
//     {
//       title: 'All Products Report',
//       icon: '📦',
//       description: 'Download a full report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
//     },
//     {
//       title: 'System Users',
//       icon: '👥',
//       description: 'Download a report of all registered users across every department.',
//       color: '#8b5cf6',
//       actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
//     },
//     {
//       title: 'Product Inventory & Request Report',
//       icon: '📊',
//       description: 'Pick a period and export the full inventory PDF report.',
//       color: '#0ea5e9',
//       actions: [{ label: 'Open Inventory Report', type: 'inventory' }],
//     },
//   ];

//   const handleAction = (action) => {
//     if (action.type === 'report') {
//       setReportError('');
//       setReportKind(action.kind || 'products');
//       setShowReportOptions(true);
//     } else if (action.type === 'inventory') {
//       setShowInventoryReport(true);
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   const modalOverlay = {
//     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
//     alignItems: 'center', justifyContent: 'center', zIndex: 1000,
//   };
//   const modalContent = {
//     backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
//     maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//   };
//   const closeButton = {
//     marginTop: '20px', padding: '10px 24px', border: 'none', borderRadius: '7px',
//     backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '14px',
//     fontWeight: '600', cursor: 'pointer',
//   };

//   const isUsersReport = reportKind === 'users';
//   const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
//   const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

//   return (
//     <div style={{ padding: '30px' }}>
//       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
//         Welcome, Super Admin — Full System Control
//       </p>

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
//         {cards.map((card) => (
//           <div
//             key={card.title}
//             style={{
//               backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
//               border: '1px solid #e2e8f0', borderLeft: `5px solid ${card.color}`,
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease',
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'; }}
//             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
//           >
//             <div style={{ width: '55px', height: '55px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '18px' }}>
//               {card.icon}
//             </div>
//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>{card.title}</h2>
//             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.description}</p>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{ width: '100%', padding: '11px 15px', border: 'none', borderRadius: '7px', backgroundColor: card.color, color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
//                 >
//                   {action.label} →
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {showInventoryReport && (
//         <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//             <h2 style={{ margin: 0, color: '#0f172a' }}>Product Inventory & Request Report</h2>
//             <button
//               onClick={() => setShowInventoryReport(false)}
//               style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
//             >
//               Close ✕
//             </button>
//           </div>
//           <ProductInventoryReport />
//         </div>
//       )}

//       {showReportOptions && (
//         <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose the format you want to download:</p>

//             {reportError && (
//               <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'pdf' ? '#f87171' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'excel' ? '#4ade80' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
//                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
//               </button>
//             </div>

//             <div style={{ textAlign: 'right' }}>
//               <button style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }} onClick={() => setShowReportOptions(false)} disabled={!!downloadingType}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const selectStyle = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' };

// export default SuperAdminDashboard;

// export default SuperAdminDashboard;
// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// const USERS_ENDPOINT = `${API_BASE}/users`;
// const REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;
// // ✅ Change this if your departments endpoint is different
// const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments`;

// // ================================================================
// // ========== PRODUCT INVENTORY & REQUEST REPORT ==================
// // ==  (Super Admin ONLY — summary + PDF export, no tables on screen)
// // ================================================================
// const ProductInventoryReport = () => {
//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [departmentUsage, setDepartmentUsage] = useState({});

//   // Period filter
//   const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
//   const [quarterFilter, setQuarterFilter] = useState('ALL');
//   const [monthFilter, setMonthFilter] = useState('ALL');

//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const REFRESH_INTERVAL = 15000;

//   useEffect(() => { fetchData(); }, []);

//   useEffect(() => {
//     if (!autoRefresh) return;
//     const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
//     return () => clearInterval(id);
//   }, [autoRefresh]);

//   const fetchData = async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);
//       setError('');
//       const [productRes, requestRes] = await Promise.all([
//         fetch(PRODUCTS_ENDPOINT),
//         fetch(REQUESTS_ENDPOINT),
//       ]);

//       if (!productRes.ok || !requestRes.ok) {
//         throw new Error('Failed to fetch data from API');
//       }

//       const productsData = await productRes.json();
//       const requestsData = await requestRes.json();

//       setRequests(requestsData);

//       const requestMap = new Map();
//       requestsData.forEach(req => {
//         if (req.product && req.product.productId) {
//           requestMap.set(req.product.productId, req);
//         }
//       });

//       const mergedData = productsData.map(prod => {
//         const req = requestMap.get(prod.productId);
//         const requestStatus = req?.status ?? 'AVAILABLE';

//         const stockStatus =
//           requestStatus === 'APPROVED'
//             ? 'Out of Stock'
//             : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

//         return {
//           ...prod,
//           productQuantity: prod.productQuantity ?? '0',
//           receiptVoucherNo: prod.receiptVoucherNo ?? '-',
//           supplierName: prod.supplierName ?? '-',
//           balance: prod.balance ?? '-',
//           requestQuantity: req?.quantity ?? '-',
//           description: req?.description ?? '-',
//           adminNote: req?.adminNote ?? '-',
//           status: requestStatus,
//           departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
//           productDescription: prod.productDescription ?? '-',
//           stockStatus,
//           requestedProductName: req?.product?.productName ?? '-',
//         };
//       });

//       setProducts(mergedData);
//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error(err);
//       if (!silent) setError('Failed to load data.');
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   const getQuarter = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return Math.floor(d.getMonth() / 3) + 1;
//   };
//   const getMonth = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getMonth() + 1;
//   };
//   const getYear = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getFullYear();
//   };
//   const getFilterDate = (item) => item.receiptDate || item.issueDate || null;

//   const years = useMemo(() => {
//     const currentYear = new Date().getFullYear();
//     return Array.from({ length: 6 }, (_, i) => currentYear - i);
//   }, []);

//   const matchesPeriod = (item) => {
//     const d = getFilterDate(item);
//     if (!d) {
//       return yearFilter === 'ALL' && quarterFilter === 'ALL' && monthFilter === 'ALL';
//     }
//     if (yearFilter !== 'ALL' && getYear(d) !== Number(yearFilter)) return false;
//     if (quarterFilter !== 'ALL' && getQuarter(d) !== Number(quarterFilter)) return false;
//     if (monthFilter !== 'ALL' && getMonth(d) !== Number(monthFilter)) return false;
//     return true;
//   };

//   const periodProducts = useMemo(
//     () => products.filter(matchesPeriod),
//     [products, yearFilter, quarterFilter, monthFilter]
//   );

//   const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
//   const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

//   useEffect(() => {
//     const deptDetails = {};
//     requests.forEach(req => {
//       if (req.status !== 'APPROVED' && req.status !== 'REJECTED') return;
//       const linkedProduct = products.find(p => p.productId === req?.product?.productId);
//       const dateStr =
//         req.receiptDate ||
//         req.issueDate ||
//         linkedProduct?.receiptDate ||
//         linkedProduct?.issueDate;

//       const y = getYear(dateStr);
//       const q = getQuarter(dateStr);
//       const m = getMonth(dateStr);

//       if (yearFilter !== 'ALL' && y !== Number(yearFilter)) return;
//       if (quarterFilter !== 'ALL' && q !== Number(quarterFilter)) return;
//       if (monthFilter !== 'ALL' && m !== Number(monthFilter)) return;

//       const dept = req.departmentName || 'Unknown';
//       const productName = req?.product?.productName ?? '-';
//       const qty = Number(req.quantity) || 0;
//       if (!deptDetails[dept]) deptDetails[dept] = [];
//       deptDetails[dept].push({ productName, qty, status: req.status });
//     });
//     setDepartmentUsage(deptDetails);
//   }, [requests, products, yearFilter, quarterFilter, monthFilter]);

//   const exportToPDF = () => {
//     const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const marginLeft = 25;
//     const marginRight = 25;
//     const tableWidth = pageWidth - marginLeft - marginRight;

//     doc.setFontSize(16);
//     doc.setTextColor(15, 23, 42);
//     doc.text('Product Inventory & Request Report', marginLeft, 40);

//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];

//     const parts = [];
//     parts.push(yearFilter === 'ALL' ? 'All Years' : String(yearFilter));
//     if (quarterFilter !== 'ALL') parts.push(`Q${quarterFilter}`);
//     if (monthFilter !== 'ALL') parts.push(monthNames[Number(monthFilter) - 1]);
//     const periodText = parts.join(' — ');

//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`Report Period: ${periodText}`, marginLeft, 70);
//     doc.setFont('helvetica', 'normal');

//     let y = 84;

//     const cardY = y + 4;
//     const cardHeight = 34;
//     const cardGap = 10;
//     const cardWidth = (tableWidth - cardGap * 2) / 3;

//     doc.setFillColor(220, 252, 231);
//     doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(22, 101, 52);
//     doc.setFontSize(9);
//     doc.text('In Stock', marginLeft + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(254, 226, 226);
//     doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(185, 28, 28);
//     doc.setFontSize(9);
//     doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(219, 234, 254);
//     doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(30, 64, 175);
//     doc.setFontSize(9);
//     doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(periodProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     y = cardY + cardHeight + 20;

//     const deptKeys = Object.keys(departmentUsage);
//     if (deptKeys.length > 0) {
//       doc.setFontSize(12);
//       doc.setTextColor(30, 64, 175);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Department-wise Usage (Approved / Rejected)', marginLeft, y);
//       doc.setFont('helvetica', 'normal');
//       y += 10;

//       const body = [];
//       deptKeys.forEach(dept => {
//         const items = departmentUsage[dept];
//         const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//         const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

//         body.push([
//           {
//             content: dept,
//             rowSpan: items.length + 1,
//             styles: {
//               valign: 'middle', halign: 'left', fontStyle: 'bold',
//               textColor: [15, 23, 42], fillColor: [241, 245, 249]
//             }
//           },
//           { content: `Total Requests: ${items.length}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [30, 64, 175], fillColor: [219, 234, 254] } },
//           { content: `Approved: ${approvedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [22, 101, 52], fillColor: [220, 252, 231] } },
//           { content: `Rejected: ${rejectedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }
//         ]);

//         items.forEach(item => {
//           body.push([
//             { content: item.productName, styles: { halign: 'left' } },
//             { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
//             {
//               content: item.status,
//               styles: {
//                 halign: 'center', fontStyle: 'bold',
//                 textColor: item.status === 'APPROVED' ? [22, 101, 52] : [185, 28, 28],
//                 fillColor: item.status === 'APPROVED' ? [240, 253, 244] : [254, 242, 242]
//               }
//             }
//           ]);
//         });
//       });

//       autoTable(doc, {
//         startY: y + 4,
//         head: [['Department', 'Product Name', 'Quantity', 'Status']],
//         body,
//         theme: 'grid',
//         styles: { fontSize: 9, cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, overflow: 'linebreak', valign: 'middle', lineColor: [203, 213, 225], lineWidth: 0.5, textColor: [30, 41, 59] },
//         headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
//         bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
//         tableWidth: tableWidth,
//         columnStyles: {
//           0: { cellWidth: 160, halign: 'left' },
//           1: { cellWidth: 'auto', halign: 'left' },
//           2: { cellWidth: 100, halign: 'center' },
//           3: { cellWidth: 100, halign: 'center' }
//         },
//         margin: { left: marginLeft, right: marginRight }
//       });

//       y = doc.lastAutoTable.finalY + 24;
//     }

//     doc.setFontSize(12);
//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Product Details', marginLeft, y);
//     doc.setFont('helvetica', 'normal');
//     y += 10;

//     autoTable(doc, {
//       startY: y + 4,
//       tableWidth: tableWidth,
//       theme: 'grid',
//       head: [[
//         'Product Name',
//         'Description',
//         'Product Qty',
//         'Req Qty',
//         'Department',
//         'Supplier',
//         'Voucher No',
//         'Price',
//         'Balance',
//         'Receipt Date',
//         'Issue Date',
//         'Staff Desc',
//         'Admin Note',
//         'Status',
//         'Stock Status'
//       ]],
//       body: periodProducts.map(p => [
//         p.productName ?? '-',
//         p.productDescription ?? '-',
//         { content: p.productQuantity ?? '0', styles: { halign: 'center', fontStyle: 'bold' } },
//         { content: p.requestQuantity ?? '-', styles: { halign: 'center' } },
//         p.departmentName ?? '-',
//         p.supplierName ?? '-',
//         p.receiptVoucherNo ?? '-',
//         { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
//         { content: p.issueDate ?? '-', styles: { halign: 'center' } },
//         p.description ?? '-',
//         p.adminNote ?? '-',
//         p.status ?? '-',
//         p.stockStatus ?? '-'
//       ]),
//       styles: {
//         fontSize: 7,
//         cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
//         overflow: 'linebreak',
//         valign: 'middle',
//         lineColor: [226, 232, 240],
//         lineWidth: 0.5,
//         textColor: [30, 41, 59]
//       },
//       headStyles: {
//         fillColor: [30, 64, 175],
//         textColor: 255,
//         fontStyle: 'bold',
//         halign: 'center',
//         valign: 'middle',
//         fontSize: 7
//       },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       columnStyles: {
//         0:  { cellWidth: 58, halign: 'left', fontStyle: 'bold' },
//         1:  { cellWidth: 70, halign: 'left' },
//         2:  { cellWidth: 50, halign: 'center' },
//         3:  { cellWidth: 40, halign: 'center' },
//         4:  { cellWidth: 55, halign: 'left' },
//         5:  { cellWidth: 55, halign: 'left' },
//         6:  { cellWidth: 55, halign: 'left' },
//         7:  { cellWidth: 38, halign: 'right' },
//         8:  { cellWidth: 38, halign: 'right' },
//         9:  { cellWidth: 55, halign: 'center' },
//         10: { cellWidth: 48, halign: 'center' },
//         11: { cellWidth: 65, halign: 'left' },
//         12: { cellWidth: 65, halign: 'left' },
//         13: { cellWidth: 48, halign: 'center' },
//         14: { cellWidth: 50, halign: 'center' }
//       },
//       margin: { left: marginLeft, right: marginRight },
//       didParseCell: (data) => {
//         if (data.section === 'body') {
//           if (data.column.index === 13) {
//             const v = data.cell.raw;
//             if (v === 'APPROVED') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fillColor = [240, 253, 244];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'REJECTED') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fillColor = [254, 242, 242];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'PENDING') {
//               data.cell.styles.textColor = [146, 64, 14];
//               data.cell.styles.fillColor = [255, 251, 235];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'CHECKED') {
//               data.cell.styles.textColor = [109, 40, 217];
//               data.cell.styles.fillColor = [237, 233, 254];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'COMPLETED') {
//               data.cell.styles.textColor = [30, 64, 175];
//               data.cell.styles.fillColor = [219, 234, 254];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//           if (data.column.index === 14) {
//             const v = data.cell.raw;
//             if (v === 'In Stock') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'Out of Stock') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//         }
//       }
//     });

//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.setTextColor(120);
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.text(`Product Inventory & Request Report — ${periodText}`, marginLeft, pageHeight - 20);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
//     }

//     const periodTag =
//       (yearFilter === 'ALL' ? 'AllYears' : yearFilter) + '_' +
//       (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter) + '_' +
//       (monthFilter === 'ALL' ? 'AllM' : 'M' + monthFilter);
//     doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   return (
//     <div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
//         <button
//           onClick={exportToPDF}
//           style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
//         >
//           Export to PDF
//         </button>

//         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
//           <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
//           Auto-refresh (15s)
//         </label>

//         {lastUpdated && (
//           <span style={{ fontSize: '12px', color: '#64748b' }}>
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//       </div>

//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
//         <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>Report Period:</strong>
//         <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Years</option>
//           {years.map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//         <select value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Quarters</option>
//           <option value="1">Q1 (Jan – Mar)</option>
//           <option value="2">Q2 (Apr – Jun)</option>
//           <option value="3">Q3 (Jul – Sep)</option>
//           <option value="4">Q4 (Oct – Dec)</option>
//         </select>

//         <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Months</option>
//           <option value="1">January</option>
//           <option value="2">February</option>
//           <option value="3">March</option>
//           <option value="4">April</option>
//           <option value="5">May</option>
//           <option value="6">June</option>
//           <option value="7">July</option>
//           <option value="8">August</option>
//           <option value="9">September</option>
//           <option value="10">October</option>
//           <option value="11">November</option>
//           <option value="12">December</option>
//         </select>

//         <button
//           onClick={() => { setYearFilter(String(new Date().getFullYear())); setQuarterFilter('ALL'); setMonthFilter('ALL'); }}
//           style={{ padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
//         >
//           This Year
//         </button>
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#1e40af' }}>Total Rows</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#1e40af' }}>{periodProducts.length}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ================================================================
// // ==================== SUPER ADMIN DASHBOARD =====================
// // ================================================================
// const SuperAdminDashboard = () => {
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');
//   const [reportKind, setReportKind] = useState('products');

//   const [showInventoryReport, setShowInventoryReport] = useState(false);

//   // ✅ NEW: cache the departments list so users' department IDs can be resolved
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const res = await fetch(DEPARTMENTS_ENDPOINT, { headers: { Accept: 'application/json' } });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (!cancelled && Array.isArray(data)) setDepartments(data);
//       } catch (_) {
//         // silent — falls back to "Dept #<id>" if unavailable
//       }
//     })();
//     return () => { cancelled = true; };
//   }, []);

//   // ✅ Build a lookup map:  "<id>" -> "Department Name"
//   const deptMap = useMemo(() => {
//     const m = new Map();
//     departments.forEach(d => {
//       const id =
//         d.departmentId ?? d.departmentID ?? d.id ?? d.deptId ?? null;
//       const name =
//         d.departmentName ?? d.departmentname ?? d.name ?? d.deptName ?? null;
//       if (id != null && name != null) m.set(String(id), name);
//     });
//     return m;
//   }, [departments]);

//   // ✅ Resolve the department display name for a user object regardless of
//   //    whether the API sends an id, an object, or a name.
//   const resolveDeptName = (u) => {
//     if (!u) return '-';

//     // 1. Direct name on the user
//     if (typeof u.departmentName === 'string' && u.departmentName.trim()) {
//       return u.departmentName;
//     }

//     // 2. Nested department object (with id and/or name)
//     if (u.department && typeof u.department === 'object') {
//       const directName =
//         u.department.departmentName ??
//         u.department.departmentname ??
//         u.department.name ??
//         u.department.deptName;
//       if (directName) return directName;

//       const deptId =
//         u.department.departmentId ??
//         u.department.departmentID ??
//         u.department.id ??
//         u.department.deptId;
//       if (deptId != null && deptMap.has(String(deptId))) {
//         return deptMap.get(String(deptId));
//       }
//       if (deptId != null) return `Dept #${deptId}`;
//     }

//     // 3. Department sent as a primitive (id or name)
//     if (u.department != null) {
//       const asStr = String(u.department);
//       if (deptMap.has(asStr)) return deptMap.get(asStr);
//       // If it's already a non-numeric string, treat it as a name
//       if (!/^\d+$/.test(asStr)) return asStr;
//       return `Dept #${asStr}`;
//     }

//     // 4. Only a departmentId was sent
//     const topId = u.departmentId ?? u.departmentID ?? u.deptId;
//     if (topId != null) {
//       if (deptMap.has(String(topId))) return deptMap.get(String(topId));
//       return `Dept #${topId}`;
//     }

//     return '-';
//   };

//   const generateProductsPdf = (products) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('All Products Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'ID', dataKey: 'id' },
//       { header: 'Name', dataKey: 'name' },
//       { header: 'Description', dataKey: 'description' },
//       { header: 'Quantity', dataKey: 'quantity' },
//       { header: 'Unit Price', dataKey: 'unitPrice' },
//       { header: 'Supplier', dataKey: 'supplier' },
//       { header: 'Receipt Date', dataKey: 'receiptDate' },
//       { header: 'Issue Date', dataKey: 'issueDate' },
//     ];
//     const rows = products.map((p) => ({
//       id: p.productId ?? '', name: p.productName ?? '', description: p.productDescription ?? '',
//       quantity: p.productQuantity ?? '', unitPrice: p.price ?? '', supplier: p.supplierName ?? '',
//       receiptDate: p.receiptDate ?? '', issueDate: p.issueDate ?? '',
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`products-report-${Date.now()}.pdf`);
//   };

//   const generateProductsExcel = (products) => {
//     const data = products.map((p) => ({
//       ID: p.productId ?? '', Name: p.productName ?? '', Description: p.productDescription ?? '',
//       Quantity: p.productQuantity ?? '', 'Unit Price': p.price ?? '', Supplier: p.supplierName ?? '',
//       'Receipt Date': p.receiptDate ?? '', 'Issue Date': p.issueDate ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 35 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 14 }, { wch: 14 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
//   };

//   // ✅ Uses resolveDeptName() so department IDs become real names
//   const generateUsersPdf = (userList) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('System Users Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'Department Name', dataKey: 'department' },
//       { header: 'Username', dataKey: 'username' },
//       { header: 'Email', dataKey: 'email' },
//       { header: 'Gender', dataKey: 'gender' },
//       { header: 'Phone', dataKey: 'phone' },
//       { header: 'Role', dataKey: 'role' },
//     ];
//     const rows = userList.map((u) => ({
//       username: u.userName ?? u.username ?? '',
//       email: u.email ?? '',
//       gender: u.gender ?? '',
//       phone: u.phoneNumber ?? u.phone ?? '',
//       role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       department: resolveDeptName(u),
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [245, 243, 255] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`users-report-${Date.now()}.pdf`);
//   };

//   // ✅ Uses resolveDeptName() so department IDs become real names
//   const generateUsersExcel = (userList) => {
//     const data = userList.map((u) => ({
//       'Department Name': resolveDeptName(u),
//       Username: u.userName ?? u.username ?? '',
//       Email: u.email ?? '',
//       Gender: u.gender ?? '',
//       Phone: u.phoneNumber ?? u.phone ?? '',
//       Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 16 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
//     XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
//   };

//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');
//     try {
//       const isUsers = reportKind === 'users';
//       const endpoint = isUsers ? USERS_ENDPOINT : PRODUCTS_ENDPOINT;
//       const response = await fetch(endpoint, { method: 'GET', headers: { Accept: 'application/json' } });

//       if (!response.ok) {
//         let errorMsg = `Server responded with ${response.status}`;
//         try { const errText = await response.text(); if (errText) errorMsg = errText; } catch (_) {}
//         throw new Error(errorMsg);
//       }

//       const data = await response.json();
//       if (!Array.isArray(data) || data.length === 0) throw new Error('No data available to export.');

//       // If we don't have departments yet (endpoint unreachable), try to grab them now
//       if (isUsers && deptMap.size === 0) {
//         try {
//           const dRes = await fetch(DEPARTMENTS_ENDPOINT, { headers: { Accept: 'application/json' } });
//           if (dRes.ok) {
//             const dData = await dRes.json();
//             if (Array.isArray(dData)) setDepartments(dData);
//           }
//         } catch (_) { /* ignore */ }
//       }

//       if (isUsers) {
//         if (type === 'pdf') generateUsersPdf(data); else generateUsersExcel(data);
//       } else {
//         if (type === 'pdf') generateProductsPdf(data); else generateProductsExcel(data);
//       }
//       setShowReportOptions(false);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       setReportError(
//         error.message === 'Failed to fetch'
//           ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
//           : error.message
//       );
//     } finally {
//       setDownloadingType(null);
//     }
//   };

//   const cards = [
//     {
//       title: 'All Products Report',
//       icon: '📦',
//       description: 'Download a full report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
//     },
//     {
//       title: 'System Users',
//       icon: '👥',
//       description: 'Download a report of all registered users across every department.',
//       color: '#8b5cf6',
//       actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
//     },
//     {
//       title: 'Product Inventory & Request Report',
//       icon: '📊',
//       description: 'Pick a period and export the full inventory PDF report.',
//       color: '#0ea5e9',
//       actions: [{ label: 'Open Inventory Report', type: 'inventory' }],
//     },
//   ];

//   const handleAction = (action) => {
//     if (action.type === 'report') {
//       setReportError('');
//       setReportKind(action.kind || 'products');
//       setShowReportOptions(true);
//     } else if (action.type === 'inventory') {
//       setShowInventoryReport(true);
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   const modalOverlay = {
//     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
//     alignItems: 'center', justifyContent: 'center', zIndex: 1000,
//   };
//   const modalContent = {
//     backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
//     maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//   };
//   const closeButton = {
//     marginTop: '20px', padding: '10px 24px', border: 'none', borderRadius: '7px',
//     backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '14px',
//     fontWeight: '600', cursor: 'pointer',
//   };

//   const isUsersReport = reportKind === 'users';
//   const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
//   const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

//   return (
//     <div style={{ padding: '30px' }}>
//       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
//         Welcome, Super Admin — Full System Control
//       </p>

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
//         {cards.map((card) => (
//           <div
//             key={card.title}
//             style={{
//               backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
//               border: '1px solid #e2e8f0', borderLeft: `5px solid ${card.color}`,
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease',
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'; }}
//             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
//           >
//             <div style={{ width: '55px', height: '55px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '18px' }}>
//               {card.icon}
//             </div>
//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>{card.title}</h2>
//             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.description}</p>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{ width: '100%', padding: '11px 15px', border: 'none', borderRadius: '7px', backgroundColor: card.color, color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
//                 >
//                   {action.label} →
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {showInventoryReport && (
//         <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//             <h2 style={{ margin: 0, color: '#0f172a' }}>Product Inventory & Request Report</h2>
//             <button
//               onClick={() => setShowInventoryReport(false)}
//               style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
//             >
//               Close ✕
//             </button>
//           </div>
//           <ProductInventoryReport />
//         </div>
//       )}

//       {showReportOptions && (
//         <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose the format you want to download:</p>

//             {reportError && (
//               <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'pdf' ? '#f87171' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'excel' ? '#4ade80' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
//                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
//               </button>
//             </div>

//             <div style={{ textAlign: 'right' }}>
//               <button style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }} onClick={() => setShowReportOptions(false)} disabled={!!downloadingType}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const selectStyle = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' };

// export default SuperAdminDashboard;

// export default SuperAdminDashboard;
// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx';

// // Use relative URLs so the dev-server proxy forwards them (no CORS)
// const API_BASE = '/api';

// const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
// const USERS_ENDPOINT = `${API_BASE}/users`;
// const REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;
// // ✅ Change this if your departments endpoint is different
// const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments`;

// // ================================================================
// // ========== PRODUCT INVENTORY & REQUEST REPORT ==================
// // ==  (Super Admin ONLY — summary + PDF export, no tables on screen)
// // ================================================================
// const ProductInventoryReport = () => {
//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [departmentUsage, setDepartmentUsage] = useState({});

//   // Period filter
//   const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
//   const [quarterFilter, setQuarterFilter] = useState('ALL');
//   const [monthFilter, setMonthFilter] = useState('ALL');

//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const REFRESH_INTERVAL = 15000;

//   useEffect(() => { fetchData(); }, []);

//   useEffect(() => {
//     if (!autoRefresh) return;
//     const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
//     return () => clearInterval(id);
//   }, [autoRefresh]);

//   const fetchData = async (silent = false) => {
//     try {
//       if (!silent) setLoading(true);
//       setError('');
//       const [productRes, requestRes] = await Promise.all([
//         fetch(PRODUCTS_ENDPOINT),
//         fetch(REQUESTS_ENDPOINT),
//       ]);

//       if (!productRes.ok || !requestRes.ok) {
//         throw new Error('Failed to fetch data from API');
//       }

//       const productsData = await productRes.json();
//       const requestsData = await requestRes.json();

//       setRequests(requestsData);

//       const requestMap = new Map();
//       requestsData.forEach(req => {
//         if (req.product && req.product.productId) {
//           requestMap.set(req.product.productId, req);
//         }
//       });

//       const mergedData = productsData.map(prod => {
//         const req = requestMap.get(prod.productId);
//         const requestStatus = req?.status ?? 'AVAILABLE';

//         const stockStatus =
//           requestStatus === 'APPROVED'
//             ? 'Out of Stock'
//             : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

//         return {
//           ...prod,
//           productQuantity: prod.productQuantity ?? '0',
//           receiptVoucherNo: prod.receiptVoucherNo ?? '-',
//           supplierName: prod.supplierName ?? '-',
//           balance: prod.balance ?? '-',
//           requestQuantity: req?.quantity ?? '-',
//           description: req?.description ?? '-',
//           adminNote: req?.adminNote ?? '-',
//           status: requestStatus,
//           departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
//           productDescription: prod.productDescription ?? '-',
//           stockStatus,
//           requestedProductName: req?.product?.productName ?? '-',
//         };
//       });

//       setProducts(mergedData);
//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error(err);
//       if (!silent) setError('Failed to load data.');
//     } finally {
//       if (!silent) setLoading(false);
//     }
//   };

//   const getQuarter = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return Math.floor(d.getMonth() / 3) + 1;
//   };
//   const getMonth = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getMonth() + 1;
//   };
//   const getYear = (dateStr) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) return null;
//     return d.getFullYear();
//   };
//   const getFilterDate = (item) => item.receiptDate || item.issueDate || null;

//   const years = useMemo(() => {
//     const currentYear = new Date().getFullYear();
//     return Array.from({ length: 6 }, (_, i) => currentYear - i);
//   }, []);

//   const matchesPeriod = (item) => {
//     const d = getFilterDate(item);
//     if (!d) {
//       return yearFilter === 'ALL' && quarterFilter === 'ALL' && monthFilter === 'ALL';
//     }
//     if (yearFilter !== 'ALL' && getYear(d) !== Number(yearFilter)) return false;
//     if (quarterFilter !== 'ALL' && getQuarter(d) !== Number(quarterFilter)) return false;
//     if (monthFilter !== 'ALL' && getMonth(d) !== Number(monthFilter)) return false;
//     return true;
//   };

//   const periodProducts = useMemo(
//     () => products.filter(matchesPeriod),
//     [products, yearFilter, quarterFilter, monthFilter]
//   );

//   const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
//   const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

//   useEffect(() => {
//     const deptDetails = {};
//     requests.forEach(req => {
//       if (req.status !== 'APPROVED' && req.status !== 'REJECTED') return;
//       const linkedProduct = products.find(p => p.productId === req?.product?.productId);
//       const dateStr =
//         req.receiptDate ||
//         req.issueDate ||
//         linkedProduct?.receiptDate ||
//         linkedProduct?.issueDate;

//       const y = getYear(dateStr);
//       const q = getQuarter(dateStr);
//       const m = getMonth(dateStr);

//       if (yearFilter !== 'ALL' && y !== Number(yearFilter)) return;
//       if (quarterFilter !== 'ALL' && q !== Number(quarterFilter)) return;
//       if (monthFilter !== 'ALL' && m !== Number(monthFilter)) return;

//       const dept = req.departmentName || 'Unknown';
//       const productName = req?.product?.productName ?? '-';
//       const qty = Number(req.quantity) || 0;
//       if (!deptDetails[dept]) deptDetails[dept] = [];
//       deptDetails[dept].push({ productName, qty, status: req.status });
//     });
//     setDepartmentUsage(deptDetails);
//   }, [requests, products, yearFilter, quarterFilter, monthFilter]);

//   const exportToPDF = () => {
//     const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const marginLeft = 25;
//     const marginRight = 25;
//     const tableWidth = pageWidth - marginLeft - marginRight;

//     doc.setFontSize(16);
//     doc.setTextColor(15, 23, 42);
//     doc.text('Product Inventory & Request Report', marginLeft, 40);

//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];

//     const parts = [];
//     parts.push(yearFilter === 'ALL' ? 'All Years' : String(yearFilter));
//     if (quarterFilter !== 'ALL') parts.push(`Q${quarterFilter}`);
//     if (monthFilter !== 'ALL') parts.push(monthNames[Number(monthFilter) - 1]);
//     const periodText = parts.join(' — ');

//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text(`Report Period: ${periodText}`, marginLeft, 70);
//     doc.setFont('helvetica', 'normal');

//     let y = 84;

//     const cardY = y + 4;
//     const cardHeight = 34;
//     const cardGap = 10;
//     const cardWidth = (tableWidth - cardGap * 2) / 3;

//     doc.setFillColor(220, 252, 231);
//     doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(22, 101, 52);
//     doc.setFontSize(9);
//     doc.text('In Stock', marginLeft + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(254, 226, 226);
//     doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(185, 28, 28);
//     doc.setFontSize(9);
//     doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     doc.setFillColor(219, 234, 254);
//     doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
//     doc.setTextColor(30, 64, 175);
//     doc.setFontSize(9);
//     doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
//     doc.setFontSize(14);
//     doc.setFont('helvetica', 'bold');
//     doc.text(String(periodProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
//     doc.setFont('helvetica', 'normal');

//     y = cardY + cardHeight + 20;

//     const deptKeys = Object.keys(departmentUsage);
//     if (deptKeys.length > 0) {
//       doc.setFontSize(12);
//       doc.setTextColor(30, 64, 175);
//       doc.setFont('helvetica', 'bold');
//       doc.text('Department-wise Usage (Approved / Rejected)', marginLeft, y);
//       doc.setFont('helvetica', 'normal');
//       y += 10;

//       const body = [];
//       deptKeys.forEach(dept => {
//         const items = departmentUsage[dept];
//         const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//         const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

//         body.push([
//           {
//             content: dept,
//             rowSpan: items.length + 1,
//             styles: {
//               valign: 'middle', halign: 'left', fontStyle: 'bold',
//               textColor: [15, 23, 42], fillColor: [241, 245, 249]
//             }
//           },
//           { content: `Total Requests: ${items.length}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [30, 64, 175], fillColor: [219, 234, 254] } },
//           { content: `Approved: ${approvedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [22, 101, 52], fillColor: [220, 252, 231] } },
//           { content: `Rejected: ${rejectedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }
//         ]);

//         items.forEach(item => {
//           body.push([
//             { content: item.productName, styles: { halign: 'left' } },
//             { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
//             {
//               content: item.status,
//               styles: {
//                 halign: 'center', fontStyle: 'bold',
//                 textColor: item.status === 'APPROVED' ? [22, 101, 52] : [185, 28, 28],
//                 fillColor: item.status === 'APPROVED' ? [240, 253, 244] : [254, 242, 242]
//               }
//             }
//           ]);
//         });
//       });

//       autoTable(doc, {
//         startY: y + 4,
//         head: [['Department', 'Product Name', 'Quantity', 'Status']],
//         body,
//         theme: 'grid',
//         styles: { fontSize: 9, cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, overflow: 'linebreak', valign: 'middle', lineColor: [203, 213, 225], lineWidth: 0.5, textColor: [30, 41, 59] },
//         headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
//         bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
//         tableWidth: tableWidth,
//         columnStyles: {
//           0: { cellWidth: 160, halign: 'left' },
//           1: { cellWidth: 'auto', halign: 'left' },
//           2: { cellWidth: 100, halign: 'center' },
//           3: { cellWidth: 100, halign: 'center' }
//         },
//         margin: { left: marginLeft, right: marginRight }
//       });

//       y = doc.lastAutoTable.finalY + 24;
//     }

//     doc.setFontSize(12);
//     doc.setTextColor(30, 64, 175);
//     doc.setFont('helvetica', 'bold');
//     doc.text('Product Details', marginLeft, y);
//     doc.setFont('helvetica', 'normal');
//     y += 10;

//     autoTable(doc, {
//       startY: y + 4,
//       tableWidth: tableWidth,
//       theme: 'grid',
//       head: [[
//         'Product Name',
//         'Description',
//         'Product Qty',
//         'Req Qty',
//         'Department',
//         'Supplier',
//         'Voucher No',
//         'Price',
//         'Balance',
//         'Receipt Date',
//         'Issue Date',
//         'Staff Desc',
//         'Admin Note',
//         'Status',
//         'Stock Status'
//       ]],
//       body: periodProducts.map(p => [
//         p.productName ?? '-',
//         p.productDescription ?? '-',
//         { content: p.productQuantity ?? '0', styles: { halign: 'center', fontStyle: 'bold' } },
//         { content: p.requestQuantity ?? '-', styles: { halign: 'center' } },
//         p.departmentName ?? '-',
//         p.supplierName ?? '-',
//         p.receiptVoucherNo ?? '-',
//         { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-', styles: { halign: 'right' } },
//         { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
//         { content: p.issueDate ?? '-', styles: { halign: 'center' } },
//         p.description ?? '-',
//         p.adminNote ?? '-',
//         p.status ?? '-',
//         p.stockStatus ?? '-'
//       ]),
//       styles: {
//         fontSize: 7,
//         cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
//         overflow: 'linebreak',
//         valign: 'middle',
//         lineColor: [226, 232, 240],
//         lineWidth: 0.5,
//         textColor: [30, 41, 59]
//       },
//       headStyles: {
//         fillColor: [30, 64, 175],
//         textColor: 255,
//         fontStyle: 'bold',
//         halign: 'center',
//         valign: 'middle',
//         fontSize: 7
//       },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       columnStyles: {
//         0:  { cellWidth: 58, halign: 'left', fontStyle: 'bold' },
//         1:  { cellWidth: 70, halign: 'left' },
//         2:  { cellWidth: 50, halign: 'center' },
//         3:  { cellWidth: 40, halign: 'center' },
//         4:  { cellWidth: 55, halign: 'left' },
//         5:  { cellWidth: 55, halign: 'left' },
//         6:  { cellWidth: 55, halign: 'left' },
//         7:  { cellWidth: 38, halign: 'right' },
//         8:  { cellWidth: 38, halign: 'right' },
//         9:  { cellWidth: 55, halign: 'center' },
//         10: { cellWidth: 48, halign: 'center' },
//         11: { cellWidth: 65, halign: 'left' },
//         12: { cellWidth: 65, halign: 'left' },
//         13: { cellWidth: 48, halign: 'center' },
//         14: { cellWidth: 50, halign: 'center' }
//       },
//       margin: { left: marginLeft, right: marginRight },
//       didParseCell: (data) => {
//         if (data.section === 'body') {
//           if (data.column.index === 13) {
//             const v = data.cell.raw;
//             if (v === 'APPROVED') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fillColor = [240, 253, 244];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'REJECTED') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fillColor = [254, 242, 242];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'PENDING') {
//               data.cell.styles.textColor = [146, 64, 14];
//               data.cell.styles.fillColor = [255, 251, 235];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'CHECKED') {
//               data.cell.styles.textColor = [109, 40, 217];
//               data.cell.styles.fillColor = [237, 233, 254];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'COMPLETED') {
//               data.cell.styles.textColor = [30, 64, 175];
//               data.cell.styles.fillColor = [219, 234, 254];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//           if (data.column.index === 14) {
//             const v = data.cell.raw;
//             if (v === 'In Stock') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fontStyle = 'bold';
//             } else if (v === 'Out of Stock') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fontStyle = 'bold';
//             }
//           }
//         }
//       }
//     });

//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.setTextColor(120);
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.text(`Product Inventory & Request Report — ${periodText}`, marginLeft, pageHeight - 20);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
//     }

//     const periodTag =
//       (yearFilter === 'ALL' ? 'AllYears' : yearFilter) + '_' +
//       (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter) + '_' +
//       (monthFilter === 'ALL' ? 'AllM' : 'M' + monthFilter);
//     doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   return (
//     <div>
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
//         <button
//           onClick={exportToPDF}
//           style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
//         >
//           Export to PDF
//         </button>

//         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
//           <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
//           Auto-refresh (15s)
//         </label>

//         {lastUpdated && (
//           <span style={{ fontSize: '12px', color: '#64748b' }}>
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//       </div>

//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
//         <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>Report Period:</strong>
//         <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Years</option>
//           {years.map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//         <select value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Quarters</option>
//           <option value="1">Q1 (Jan – Mar)</option>
//           <option value="2">Q2 (Apr – Jun)</option>
//           <option value="3">Q3 (Jul – Sep)</option>
//           <option value="4">Q4 (Oct – Dec)</option>
//         </select>

//         <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={selectStyle}>
//           <option value="ALL">All Months</option>
//           <option value="1">January</option>
//           <option value="2">February</option>
//           <option value="3">March</option>
//           <option value="4">April</option>
//           <option value="5">May</option>
//           <option value="6">June</option>
//           <option value="7">July</option>
//           <option value="8">August</option>
//           <option value="9">September</option>
//           <option value="10">October</option>
//           <option value="11">November</option>
//           <option value="12">December</option>
//         </select>

//         <button
//           onClick={() => { setYearFilter(String(new Date().getFullYear())); setQuarterFilter('ALL'); setMonthFilter('ALL'); }}
//           style={{ padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
//         >
//           This Year
//         </button>
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
//           </div>
//           <div style={{ flex: 1, padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px' }}>
//             <h3 style={{ margin: 0, color: '#1e40af' }}>Total Rows</h3>
//             <p style={{ fontSize: '24px', margin: '10px 0', color: '#1e40af' }}>{periodProducts.length}</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // ================================================================
// // ==================== SUPER ADMIN DASHBOARD =====================
// // ================================================================
// const SuperAdminDashboard = () => {
//   const [showReportOptions, setShowReportOptions] = useState(false);
//   const [downloadingType, setDownloadingType] = useState(null);
//   const [reportError, setReportError] = useState('');
//   const [reportKind, setReportKind] = useState('products');

//   const [showInventoryReport, setShowInventoryReport] = useState(false);

//   // ✅ Departments cache (for resolving departmentId → departmentName)
//   const [departments, setDepartments] = useState([]);

//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const res = await fetch(DEPARTMENTS_ENDPOINT, { headers: { Accept: 'application/json' } });
//         if (!res.ok) return;
//         const data = await res.json();
//         if (!cancelled && Array.isArray(data)) setDepartments(data);
//       } catch (_) {
//         // silent — falls back to "Dept #<id>" if unavailable
//       }
//     })();
//     return () => { cancelled = true; };
//   }, []);

//   // ✅ Map: "<id>" -> "Department Name"
//   const deptMap = useMemo(() => {
//     const m = new Map();
//     departments.forEach(d => {
//       const id =
//         d.departmentId ?? d.departmentID ?? d.id ?? d.deptId ?? null;
//       const name =
//         d.departmentName ?? d.departmentname ?? d.name ?? d.deptName ?? null;
//       if (id != null && name != null) m.set(String(id), name);
//     });
//     return m;
//   }, [departments]);

//   // ✅ Resolve department display name from any shape
//   const resolveDeptName = (u) => {
//     if (!u) return '-';

//     if (typeof u.departmentName === 'string' && u.departmentName.trim()) {
//       return u.departmentName;
//     }

//     if (u.department && typeof u.department === 'object') {
//       const directName =
//         u.department.departmentName ??
//         u.department.departmentname ??
//         u.department.name ??
//         u.department.deptName;
//       if (directName) return directName;

//       const deptId =
//         u.department.departmentId ??
//         u.department.departmentID ??
//         u.department.id ??
//         u.department.deptId;
//       if (deptId != null && deptMap.has(String(deptId))) {
//         return deptMap.get(String(deptId));
//       }
//       if (deptId != null) return `Dept #${deptId}`;
//     }

//     if (u.department != null) {
//       const asStr = String(u.department);
//       if (deptMap.has(asStr)) return deptMap.get(asStr);
//       if (!/^\d+$/.test(asStr)) return asStr;
//       return `Dept #${asStr}`;
//     }

//     const topId = u.departmentId ?? u.departmentID ?? u.deptId;
//     if (topId != null) {
//       if (deptMap.has(String(topId))) return deptMap.get(String(topId));
//       return `Dept #${topId}`;
//     }

//     return '-';
//   };

//   // ✅ Robust text helper — never return undefined/null
//   const txt = (v, fallback = '-') =>
//     v === null || v === undefined || v === '' ? fallback : v;

//   // ✅ Robust date helper — formats ISO date to yyyy-mm-dd, or '-'
//   const fmtDate = (v) => {
//     if (!v) return '-';
//     try {
//       const s = String(v);
//       if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
//       const d = new Date(v);
//       if (isNaN(d.getTime())) return s;
//       const yyyy = d.getFullYear();
//       const mm = String(d.getMonth() + 1).padStart(2, '0');
//       const dd = String(d.getDate()).padStart(2, '0');
//       return `${yyyy}-${mm}-${dd}`;
//     } catch {
//       return String(v);
//     }
//   };

//   // ✅ Merge product + request into the full row for the Products Report
//   const buildFullProductRows = (productsData, requestsData) => {
//     const requestMap = new Map();
//     (requestsData || []).forEach(req => {
//       const pid = req?.product?.productId;
//       if (pid != null) requestMap.set(String(pid), req);
//     });

//     return (productsData || []).map(prod => {
//       const req = requestMap.get(String(prod.productId));
//       const requestStatus = req?.status ?? 'AVAILABLE';
//       const stockStatus =
//         requestStatus === 'APPROVED'
//           ? 'Out of Stock'
//           : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

//       // Department name — try request first, then product.departmentId lookup
//       let deptName = req?.departmentName;
//       if (!deptName && prod.departmentId != null && deptMap.has(String(prod.departmentId))) {
//         deptName = deptMap.get(String(prod.departmentId));
//       }
//       if (!deptName && prod.departmentId != null) {
//         deptName = `Dept #${prod.departmentId}`;
//       }
//       if (!deptName) deptName = '-';

//       return {
//         id: prod.productId ?? '-',
//         productName: txt(prod.productName),
//         productDescription: txt(prod.productDescription),
//         qtyReq: txt(req?.quantity),
//         productQuantity: txt(prod.productQuantity, '0'),
//         departmentName: deptName,
//         supplierName: txt(prod.supplierName),
//         receiptVoucherNo: txt(prod.receiptVoucherNo),
//         price: prod.price != null ? Number(prod.price).toLocaleString() : '-',
//         balance: prod.balance != null ? Number(prod.balance).toLocaleString() : '-',
//         receiptDate: fmtDate(prod.receiptDate),
//         issueDate: fmtDate(prod.issueDate),
//         staffDesc: txt(req?.description),
//         adminNote: txt(req?.adminNote),
//         status: requestStatus,
//         stockStatus,
//       };
//     });
//   };

//   // ============ PRODUCTS PDF ============
//   const generateProductsPdf = (rows) => {
//     const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const marginLeft = 20;
//     const marginRight = 20;
//     const tableWidth = pageWidth - marginLeft - marginRight;

//     doc.setFontSize(16);
//     doc.setTextColor(15, 23, 42);
//     doc.text('All Products Report', marginLeft, 36);

//     doc.setFontSize(9);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 52);

//     autoTable(doc, {
//       startY: 64,
//       tableWidth,
//       theme: 'grid',
//       head: [[
//         'ID',
//         'Product Name',
//         'Description',
//         'Qty Req',
//         'Product Qty',
//         'Department Name',
//         'Supplier',
//         'Voucher No',
//         'Price',
//         'Balance',
//         'Receipt Date',
//         'Issue Date',
//         'Staff Desc',
//         'Admin Note',
//         'Status',
//         'Stock Status'
//       ]],
//       body: rows.map(r => [
//         { content: String(r.id), styles: { halign: 'center' } },
//         r.productName,
//         r.productDescription,
//         { content: String(r.qtyReq), styles: { halign: 'center', fontStyle: 'bold' } },
//         { content: String(r.productQuantity), styles: { halign: 'center', fontStyle: 'bold' } },
//         r.departmentName,
//         r.supplierName,
//         r.receiptVoucherNo,
//         { content: String(r.price), styles: { halign: 'right' } },
//         { content: String(r.balance), styles: { halign: 'right' } },
//         { content: r.receiptDate, styles: { halign: 'center' } },
//         { content: r.issueDate, styles: { halign: 'center' } },
//         r.staffDesc,
//         r.adminNote,
//         { content: r.status, styles: { halign: 'center', fontStyle: 'bold' } },
//         { content: r.stockStatus, styles: { halign: 'center', fontStyle: 'bold' } },
//       ]),
//       styles: {
//         fontSize: 7,
//         cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
//         overflow: 'linebreak',
//         valign: 'middle',
//         lineColor: [226, 232, 240],
//         lineWidth: 0.5,
//         textColor: [30, 41, 59],
//       },
//       headStyles: {
//         fillColor: [59, 130, 246],
//         textColor: 255,
//         fontStyle: 'bold',
//         halign: 'center',
//         valign: 'middle',
//         fontSize: 7,
//       },
//       alternateRowStyles: { fillColor: [248, 250, 252] },
//       columnStyles: {
//         0:  { cellWidth: 28, halign: 'center' },   // ID
//         1:  { cellWidth: 60, halign: 'left', fontStyle: 'bold' }, // Product Name
//         2:  { cellWidth: 70, halign: 'left' },     // Description
//         3:  { cellWidth: 35, halign: 'center' },   // Qty Req
//         4:  { cellWidth: 45, halign: 'center' },   // Product Qty
//         5:  { cellWidth: 60, halign: 'left' },     // Department Name
//         6:  { cellWidth: 55, halign: 'left' },     // Supplier
//         7:  { cellWidth: 50, halign: 'left' },     // Voucher No
//         8:  { cellWidth: 38, halign: 'right' },    // Price
//         9:  { cellWidth: 40, halign: 'right' },    // Balance
//         10: { cellWidth: 55, halign: 'center' },   // Receipt Date
//         11: { cellWidth: 50, halign: 'center' },   // Issue Date
//         12: { cellWidth: 65, halign: 'left' },     // Staff Desc
//         13: { cellWidth: 65, halign: 'left' },     // Admin Note
//         14: { cellWidth: 52, halign: 'center' },   // Status
//         15: { cellWidth: 52, halign: 'center' },   // Stock Status
//       },
//       margin: { left: marginLeft, right: marginRight },
//       didParseCell: (data) => {
//         if (data.section === 'body') {
//           if (data.column.index === 14) {
//             const v = data.cell.raw;
//             if (v === 'APPROVED') {
//               data.cell.styles.textColor = [22, 101, 52];
//               data.cell.styles.fillColor = [240, 253, 244];
//             } else if (v === 'REJECTED') {
//               data.cell.styles.textColor = [185, 28, 28];
//               data.cell.styles.fillColor = [254, 242, 242];
//             } else if (v === 'PENDING') {
//               data.cell.styles.textColor = [146, 64, 14];
//               data.cell.styles.fillColor = [255, 251, 235];
//             } else if (v === 'CHECKED') {
//               data.cell.styles.textColor = [109, 40, 217];
//               data.cell.styles.fillColor = [237, 233, 254];
//             } else if (v === 'COMPLETED') {
//               data.cell.styles.textColor = [30, 64, 175];
//               data.cell.styles.fillColor = [219, 234, 254];
//             }
//           }
//           if (data.column.index === 15) {
//             const v = data.cell.raw;
//             if (v === 'In Stock') {
//               data.cell.styles.textColor = [22, 101, 52];
//             } else if (v === 'Out of Stock') {
//               data.cell.styles.textColor = [185, 28, 28];
//             }
//           }
//         }
//       },
//     });

//     const pageCount = doc.internal.getNumberOfPages();
//     for (let i = 1; i <= pageCount; i++) {
//       doc.setPage(i);
//       doc.setFontSize(8);
//       doc.setTextColor(120);
//       const pageHeight = doc.internal.pageSize.getHeight();
//       doc.text('All Products Report', marginLeft, pageHeight - 20);
//       doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
//     }

//     doc.save(`products-report-${Date.now()}.pdf`);
//   };

//   // ============ PRODUCTS EXCEL ============
//   const generateProductsExcel = (rows) => {
//     const data = rows.map(r => ({
//       ID: r.id,
//       'Product Name': r.productName,
//       Description: r.productDescription,
//       'Qty Req': r.qtyReq,
//       'Product Qty': r.productQuantity,
//       'Department Name': r.departmentName,
//       Supplier: r.supplierName,
//       'Voucher No': r.receiptVoucherNo,
//       Price: r.price,
//       Balance: r.balance,
//       'Receipt Date': r.receiptDate,
//       'Issue Date': r.issueDate,
//       'Staff Desc': r.staffDesc,
//       'Admin Note': r.adminNote,
//       Status: r.status,
//       'Stock Status': r.stockStatus,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [
//       { wch: 6 },  // ID
//       { wch: 24 }, // Product Name
//       { wch: 32 }, // Description
//       { wch: 8 },  // Qty Req
//       { wch: 11 }, // Product Qty
//       { wch: 22 }, // Department Name
//       { wch: 22 }, // Supplier
//       { wch: 18 }, // Voucher No
//       { wch: 12 }, // Price
//       { wch: 12 }, // Balance
//       { wch: 14 }, // Receipt Date
//       { wch: 14 }, // Issue Date
//       { wch: 28 }, // Staff Desc
//       { wch: 28 }, // Admin Note
//       { wch: 14 }, // Status
//       { wch: 14 }, // Stock Status
//     ];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
//     XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
//   };

//   // ============ USERS PDF / EXCEL ============
//   const generateUsersPdf = (userList) => {
//     const doc = new jsPDF({ orientation: 'landscape' });
//     doc.setFontSize(16);
//     doc.text('System Users Report', 14, 18);
//     doc.setFontSize(10);
//     doc.setTextColor(100);
//     doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

//     const columns = [
//       { header: 'Department Name', dataKey: 'department' },
//       { header: 'Username', dataKey: 'username' },
//       { header: 'Email', dataKey: 'email' },
//       { header: 'Gender', dataKey: 'gender' },
//       { header: 'Phone', dataKey: 'phone' },
//       { header: 'Role', dataKey: 'role' },
//     ];
//     const rows = userList.map((u) => ({
//       username: u.userName ?? u.username ?? '',
//       email: u.email ?? '',
//       gender: u.gender ?? '',
//       phone: u.phoneNumber ?? u.phone ?? '',
//       role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//       department: resolveDeptName(u),
//     }));

//     autoTable(doc, {
//       columns, body: rows, startY: 30,
//       styles: { fontSize: 9, cellPadding: 3 },
//       headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
//       alternateRowStyles: { fillColor: [245, 243, 255] },
//       margin: { left: 10, right: 10 },
//     });
//     doc.save(`users-report-${Date.now()}.pdf`);
//   };

//   const generateUsersExcel = (userList) => {
//     const data = userList.map((u) => ({
//       'Department Name': resolveDeptName(u),
//       Username: u.userName ?? u.username ?? '',
//       Email: u.email ?? '',
//       Gender: u.gender ?? '',
//       Phone: u.phoneNumber ?? u.phone ?? '',
//       Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
//     }));
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     worksheet['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 16 }];
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
//     XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
//   };

//   // ============ DOWNLOAD HANDLER ============
//   const handleDownloadReport = async (type) => {
//     setDownloadingType(type);
//     setReportError('');
//     try {
//       const isUsers = reportKind === 'users';

//       // Make sure we have the departments cached (for department name lookup)
//       if (deptMap.size === 0) {
//         try {
//           const dRes = await fetch(DEPARTMENTS_ENDPOINT, { headers: { Accept: 'application/json' } });
//           if (dRes.ok) {
//             const dData = await dRes.json();
//             if (Array.isArray(dData)) setDepartments(dData);
//           }
//         } catch (_) { /* ignore */ }
//       }

//       if (isUsers) {
//         const response = await fetch(USERS_ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' } });
//         if (!response.ok) {
//           let errorMsg = `Server responded with ${response.status}`;
//           try { const errText = await response.text(); if (errText) errorMsg = errText; } catch (_) {}
//           throw new Error(errorMsg);
//         }
//         const data = await response.json();
//         if (!Array.isArray(data) || data.length === 0) throw new Error('No data available to export.');
//         if (type === 'pdf') generateUsersPdf(data); else generateUsersExcel(data);
//       } else {
//         // ✅ Products report — fetch products AND requests, then merge
//         const [prodRes, reqRes] = await Promise.all([
//           fetch(PRODUCTS_ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' } }),
//           fetch(REQUESTS_ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' } }),
//         ]);
//         if (!prodRes.ok) throw new Error(`Products endpoint responded with ${prodRes.status}`);
//         const productsData = await prodRes.json();
//         const requestsData = reqRes.ok ? await reqRes.json() : [];
//         if (!Array.isArray(productsData) || productsData.length === 0) {
//           throw new Error('No products available to export.');
//         }
//         const rows = buildFullProductRows(productsData, requestsData);
//         if (type === 'pdf') generateProductsPdf(rows); else generateProductsExcel(rows);
//       }

//       setShowReportOptions(false);
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       setReportError(
//         error.message === 'Failed to fetch'
//           ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
//           : error.message
//       );
//     } finally {
//       setDownloadingType(null);
//     }
//   };

//   const cards = [
//     {
//       title: 'All Products Report',
//       icon: '📦',
//       description: 'Download a full report of all registered products.',
//       color: '#3b82f6',
//       actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
//     },
//     {
//       title: 'System Users',
//       icon: '👥',
//       description: 'Download a report of all registered users across every department.',
//       color: '#8b5cf6',
//       actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
//     },
//     {
//       title: 'Product Inventory & Request Report',
//       icon: '📊',
//       description: 'Pick a period and export the full inventory PDF report.',
//       color: '#0ea5e9',
//       actions: [{ label: 'Open Inventory Report', type: 'inventory' }],
//     },
//   ];

//   const handleAction = (action) => {
//     if (action.type === 'report') {
//       setReportError('');
//       setReportKind(action.kind || 'products');
//       setShowReportOptions(true);
//     } else if (action.type === 'inventory') {
//       setShowInventoryReport(true);
//     } else if (action.path) {
//       window.location.href = action.path;
//     }
//   };

//   const modalOverlay = {
//     position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
//     alignItems: 'center', justifyContent: 'center', zIndex: 1000,
//   };
//   const modalContent = {
//     backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
//     maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
//     boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
//   };
//   const closeButton = {
//     marginTop: '20px', padding: '10px 24px', border: 'none', borderRadius: '7px',
//     backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '14px',
//     fontWeight: '600', cursor: 'pointer',
//   };

//   const isUsersReport = reportKind === 'users';
//   const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
//   const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

//   return (
//     <div style={{ padding: '30px' }}>
//       <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
//         Welcome, Super Admin — Full System Control
//       </p>

//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
//         {cards.map((card) => (
//           <div
//             key={card.title}
//             style={{
//               backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
//               border: '1px solid #e2e8f0', borderLeft: `5px solid ${card.color}`,
//               boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease',
//             }}
//             onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'; }}
//             onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
//           >
//             <div style={{ width: '55px', height: '55px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '18px' }}>
//               {card.icon}
//             </div>
//             <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>{card.title}</h2>
//             <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.description}</p>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {card.actions.map((action) => (
//                 <button
//                   key={action.label}
//                   onClick={() => handleAction(action)}
//                   style={{ width: '100%', padding: '11px 15px', border: 'none', borderRadius: '7px', backgroundColor: card.color, color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
//                 >
//                   {action.label} →
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {showInventoryReport && (
//         <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
//             <h2 style={{ margin: 0, color: '#0f172a' }}>Product Inventory & Request Report</h2>
//             <button
//               onClick={() => setShowInventoryReport(false)}
//               style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
//             >
//               Close ✕
//             </button>
//           </div>
//           <ProductInventoryReport />
//         </div>
//       )}

//       {showReportOptions && (
//         <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
//           <div style={modalContent} onClick={(e) => e.stopPropagation()}>
//             <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
//             <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose the format you want to download:</p>

//             {reportError && (
//               <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 ⚠️ {reportError}
//               </div>
//             )}

//             <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
//               <button
//                 onClick={() => handleDownloadReport('pdf')}
//                 disabled={downloadingType === 'pdf'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'pdf' ? '#f87171' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
//                 {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
//               </button>

//               <button
//                 onClick={() => handleDownloadReport('excel')}
//                 disabled={downloadingType === 'excel'}
//                 style={{
//                   flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
//                   background: downloadingType === 'excel' ? '#4ade80' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
//                   color: '#fff', fontSize: '15px', fontWeight: '700',
//                   cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
//                   boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
//                   display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
//                 }}
//               >
//                 <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
//                 {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
//               </button>
//             </div>

//             <div style={{ textAlign: 'right' }}>
//               <button style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }} onClick={() => setShowReportOptions(false)} disabled={!!downloadingType}>
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const selectStyle = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' };

// export default SuperAdminDashboard;

import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Use relative URLs so the dev-server proxy forwards them (no CORS)
const API_BASE = '/api';

const PRODUCTS_ENDPOINT = `${API_BASE}/products/all`;
const USERS_ENDPOINT = `${API_BASE}/users`;
const REQUESTS_ENDPOINT = `${API_BASE}/product-requests/all`;
// ✅ Change this if your departments endpoint is different
const DEPARTMENTS_ENDPOINT = `${API_BASE}/departments`;

// ================================================================
// ========== PRODUCT INVENTORY & REQUEST REPORT ==================
// ==  (Super Admin ONLY — summary + PDF export, no tables on screen)
// ================================================================
const ProductInventoryReport = () => {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [departmentUsage, setDepartmentUsage] = useState({});

  // Period filter
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [quarterFilter, setQuarterFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');

  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const REFRESH_INTERVAL = 15000;

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchData(true), REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const [productRes, requestRes] = await Promise.all([
        fetch(PRODUCTS_ENDPOINT),
        fetch(REQUESTS_ENDPOINT),
      ]);

      if (!productRes.ok || !requestRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const productsData = await productRes.json();
      const requestsData = await requestRes.json();

      setRequests(requestsData);

      const requestMap = new Map();
      requestsData.forEach(req => {
        if (req.product && req.product.productId) {
          requestMap.set(req.product.productId, req);
        }
      });

      const mergedData = productsData.map(prod => {
        const req = requestMap.get(prod.productId);
        const requestStatus = req?.status ?? 'AVAILABLE';
        const productQty = Number(prod.productQuantity) || 0;
        const requestedQty = Number(req?.quantity) || 0;

        // ✅ Remaining stock: subtract only when request was APPROVED
        const remainingStock =
          requestStatus === 'APPROVED'
            ? productQty - requestedQty
            : productQty;

        const stockStatus = remainingStock > 0 ? 'In Stock' : 'Out of Stock';

        return {
          ...prod,
          productQuantity: prod.productQuantity ?? '0',
          receiptVoucherNo: prod.receiptVoucherNo ?? '-',
          supplierName: prod.supplierName ?? '-',
          balance: prod.balance ?? '-',
          requestQuantity: req?.quantity ?? '-',
          description: req?.description ?? '-',
          adminNote: req?.adminNote ?? '-',
          status: requestStatus,
          departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
          productDescription: prod.productDescription ?? '-',
          remainingStock,
          stockStatus,
          requestedProductName: req?.product?.productName ?? '-',
        };
      });

      setProducts(mergedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (!silent) setError('Failed to load data.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const getQuarter = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor(d.getMonth() / 3) + 1;
  };
  const getMonth = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.getMonth() + 1;
  };
  const getYear = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.getFullYear();
  };
  const getFilterDate = (item) => item.receiptDate || item.issueDate || null;

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  }, []);

  const matchesPeriod = (item) => {
    const d = getFilterDate(item);
    if (!d) {
      return yearFilter === 'ALL' && quarterFilter === 'ALL' && monthFilter === 'ALL';
    }
    if (yearFilter !== 'ALL' && getYear(d) !== Number(yearFilter)) return false;
    if (quarterFilter !== 'ALL' && getQuarter(d) !== Number(quarterFilter)) return false;
    if (monthFilter !== 'ALL' && getMonth(d) !== Number(monthFilter)) return false;
    return true;
  };

  const periodProducts = useMemo(
    () => products.filter(matchesPeriod),
    [products, yearFilter, quarterFilter, monthFilter]
  );

  // ---- Group products by productId, summing PQty / ReqQty / Remaining ----
  const groupedProducts = useMemo(() => {
    const map = new Map();
    periodProducts.forEach(p => {
      const key = p.productId;
      if (!map.has(key)) {
        map.set(key, {
          ...p,
          totalQuantity: 0,
          totalRequested: 0,
          totalRemaining: 0,
          occurrences: 0,
        });
      }
      const existing = map.get(key);
      existing.totalQuantity += Number(p.productQuantity) || 0;
      existing.totalRequested += Number(p.requestQuantity) || 0;
      existing.totalRemaining += Number(p.remainingStock) || 0;
      existing.occurrences += 1;
    });
    return Array.from(map.values());
  }, [periodProducts]);

  // ---------- REAL-WORLD SUMMARY CARDS ----------
  // Total Products = number of unique products (SKUs)
  const totalProductCount = groupedProducts.length;

  // In Stock = number of products with available remaining > 0
  const inStockCount = groupedProducts.filter(p => p.totalRemaining > 0).length;

  // Out of Stock = number of products with remaining <= 0
  const outStockCount = groupedProducts.filter(p => p.totalRemaining <= 0).length;

  // Total Stock Qty = units currently on hand (remaining, floored at 0)
  const totalStockQty = groupedProducts.reduce(
    (sum, p) => sum + Math.max(0, Number(p.totalRemaining) || 0),
    0
  );

  useEffect(() => {
    const deptDetails = {};
    requests.forEach(req => {
      if (req.status !== 'APPROVED' && req.status !== 'REJECTED') return;
      const linkedProduct = products.find(p => p.productId === req?.product?.productId);
      const dateStr =
        req.receiptDate ||
        req.issueDate ||
        linkedProduct?.receiptDate ||
        linkedProduct?.issueDate;

      const y = getYear(dateStr);
      const q = getQuarter(dateStr);
      const m = getMonth(dateStr);

      if (yearFilter !== 'ALL' && y !== Number(yearFilter)) return;
      if (quarterFilter !== 'ALL' && q !== Number(quarterFilter)) return;
      if (monthFilter !== 'ALL' && m !== Number(monthFilter)) return;

      const dept = req.departmentName || 'Unknown';
      const productName = req?.product?.productName ?? '-';
      const qty = Number(req.quantity) || 0;
      if (!deptDetails[dept]) deptDetails[dept] = [];
      deptDetails[dept].push({ productName, qty, status: req.status });
    });
    setDepartmentUsage(deptDetails);
  }, [requests, products, yearFilter, quarterFilter, monthFilter]);

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 25;
    const marginRight = 25;
    const tableWidth = pageWidth - marginLeft - marginRight;

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('Product Inventory & Request Report', marginLeft, 40);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 56);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const parts = [];
    parts.push(yearFilter === 'ALL' ? 'All Years' : String(yearFilter));
    if (quarterFilter !== 'ALL') parts.push(`Q${quarterFilter}`);
    if (monthFilter !== 'ALL') parts.push(monthNames[Number(monthFilter) - 1]);
    const periodText = parts.join(' — ');

    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Period: ${periodText}`, marginLeft, 70);
    doc.setFont('helvetica', 'normal');

    let y = 84;

    // ---- Summary Cards (4 cards — real-world layout) ----
    const cardY = y + 4;
    const cardHeight = 34;
    const cardGap = 10;
    const cardWidth = (tableWidth - cardGap * 3) / 4;

    // Total Products
    doc.setFillColor(219, 234, 254);
    doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.text('Total Products', marginLeft + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(totalProductCount), marginLeft + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    // In Stock
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(marginLeft + (cardWidth + cardGap), cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.text('In Stock', marginLeft + (cardWidth + cardGap) + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(inStockCount), marginLeft + (cardWidth + cardGap) + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    // Out of Stock
    doc.setFillColor(254, 226, 226);
    doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(9);
    doc.text('Out of Stock', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(outStockCount), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    // Total Stock Qty
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(marginLeft + (cardWidth + cardGap) * 3, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.text('Total Remain Stock Qty', marginLeft + (cardWidth + cardGap) * 3 + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(totalStockQty), marginLeft + (cardWidth + cardGap) * 3 + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    y = cardY + cardHeight + 20;

    const deptKeys = Object.keys(departmentUsage);
    if (deptKeys.length > 0) {
      doc.setFontSize(12);
      doc.setTextColor(30, 64, 175);
      doc.setFont('helvetica', 'bold');
      doc.text('Department-wise Usage (Approved / Rejected)', marginLeft, y);
      doc.setFont('helvetica', 'normal');
      y += 10;

      const body = [];
      deptKeys.forEach(dept => {
        const items = departmentUsage[dept];
        const approvedCount = items.filter(i => i.status === 'APPROVED').length;
        const rejectedCount = items.filter(i => i.status === 'REJECTED').length;

        body.push([
          {
            content: dept,
            rowSpan: items.length + 1,
            styles: {
              valign: 'middle', halign: 'left', fontStyle: 'bold',
              textColor: [15, 23, 42], fillColor: [241, 245, 249]
            }
          },
          { content: `Total Requests: ${items.length}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [30, 64, 175], fillColor: [219, 234, 254] } },
          { content: `Approved: ${approvedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [22, 101, 52], fillColor: [220, 252, 231] } },
          { content: `Rejected: ${rejectedCount}`, styles: { fontStyle: 'bold', halign: 'center', textColor: [185, 28, 28], fillColor: [254, 226, 226] } }
        ]);

        items.forEach(item => {
          body.push([
            { content: item.productName, styles: { halign: 'left' } },
            { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
            {
              content: item.status,
              styles: {
                halign: 'center', fontStyle: 'bold',
                textColor: item.status === 'APPROVED' ? [22, 101, 52] : [185, 28, 28],
                fillColor: item.status === 'APPROVED' ? [240, 253, 244] : [254, 242, 242]
              }
            }
          ]);
        });
      });

      autoTable(doc, {
        startY: y + 4,
        head: [['Department', 'Product Name', 'Quantity', 'Status']],
        body,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: { top: 6, right: 8, bottom: 6, left: 8 }, overflow: 'linebreak', valign: 'middle', lineColor: [203, 213, 225], lineWidth: 0.5, textColor: [30, 41, 59] },
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', valign: 'middle', fontSize: 9 },
        bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
        tableWidth: tableWidth,
        columnStyles: {
          0: { cellWidth: 160, halign: 'left' },
          1: { cellWidth: 'auto', halign: 'left' },
          2: { cellWidth: 100, halign: 'center' },
          3: { cellWidth: 100, halign: 'center' }
        },
        margin: { left: marginLeft, right: marginRight }
      });

      y = doc.lastAutoTable.finalY + 24;
    }

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('Product Details', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    y += 10;

    autoTable(doc, {
      startY: y + 4,
      tableWidth: tableWidth,
      theme: 'grid',
      head: [[
        'Product Name',
        'Description',
        'Product Qty',
        'Req Qty',
        'Remaining',
        'Department',
        'Supplier',
        'Voucher No',
        'Price',
        'Balance',
        'Receipt Date',
        'Issue Date',
        'Staff Desc',
        'Admin Note',
        'Status',
        'Stock Status'
      ]],
      body: groupedProducts.map(p => [
        p.productName ?? '-',
        p.productDescription ?? '-',
        { content: String(p.totalQuantity ?? '0'), styles: { halign: 'center', fontStyle: 'bold' } },
        { content: String(p.totalRequested ?? '-'), styles: { halign: 'center' } },
        {
          content: String(p.totalRemaining ?? '-'),
          styles: {
            halign: 'center', fontStyle: 'bold',
            textColor: p.totalRemaining > 0 ? [22, 101, 52] : [185, 28, 28]
          }
        },
        p.departmentName ?? '-',
        p.supplierName ?? '-',
        p.receiptVoucherNo ?? '-',
        { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
        { content: p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-', styles: { halign: 'right' } },
        { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
        { content: p.issueDate ?? '-', styles: { halign: 'center' } },
        p.description ?? '-',
        p.adminNote ?? '-',
        p.status ?? '-',
        { content: p.totalRemaining > 0 ? 'In Stock' : 'Out of Stock', styles: { halign: 'center' } }
      ]),
      styles: {
        fontSize: 7,
        cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
        overflow: 'linebreak',
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 7
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0:  { cellWidth: 55, halign: 'left', fontStyle: 'bold' },
        1:  { cellWidth: 65, halign: 'left' },
        2:  { cellWidth: 42, halign: 'center' },
        3:  { cellWidth: 38, halign: 'center' },
        4:  { cellWidth: 42, halign: 'center' },
        5:  { cellWidth: 52, halign: 'left' },
        6:  { cellWidth: 50, halign: 'left' },
        7:  { cellWidth: 55, halign: 'left' },
        8:  { cellWidth: 38, halign: 'right' },
        9:  { cellWidth: 38, halign: 'right' },
        10: { cellWidth: 52, halign: 'center' },
        11: { cellWidth: 48, halign: 'center' },
        12: { cellWidth: 60, halign: 'left' },
        13: { cellWidth: 60, halign: 'left' },
        14: { cellWidth: 50, halign: 'center' },
        15: { cellWidth: 50, halign: 'center' }
      },
      margin: { left: marginLeft, right: marginRight },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Remaining column (index 4)
          if (data.column.index === 4) {
            const v = Number(data.cell.raw);
            if (!isNaN(v) && v > 0) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fillColor = [240, 253, 244];
              data.cell.styles.fontStyle = 'bold';
            } else if (!isNaN(v)) {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 242, 242];
              data.cell.styles.fontStyle = 'bold';
            }
          }

          // Balance column (index 9)
          if (data.column.index === 9) {
            const v = data.cell.raw;
            if (v !== '-' && Number(String(v).replace(/,/g, '')) > 0) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = 'bold';
            } else if (v !== '-') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fontStyle = 'bold';
            }
          }

          // Admin Status column (index 14)
          if (data.column.index === 14) {
            const v = data.cell.raw;
            if (v === 'APPROVED') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fillColor = [240, 253, 244];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'REJECTED') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 242, 242];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'PENDING') {
              data.cell.styles.textColor = [146, 64, 14];
              data.cell.styles.fillColor = [255, 251, 235];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'CHECKED') {
              data.cell.styles.textColor = [109, 40, 217];
              data.cell.styles.fillColor = [237, 233, 254];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'COMPLETED') {
              data.cell.styles.textColor = [30, 64, 175];
              data.cell.styles.fillColor = [219, 234, 254];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'AVAILABLE') {
              data.cell.styles.textColor = [30, 64, 175];
              data.cell.styles.fillColor = [219, 234, 254];
              data.cell.styles.fontStyle = 'bold';
            }
          }

          // Stock Status column (index 15)
          if (data.column.index === 15) {
            const v = data.cell.raw;
            if (v === 'In Stock') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fillColor = [220, 252, 231];
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.halign = 'center';
            } else if (v === 'Out of Stock') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 226, 226];
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.halign = 'center';
            }
          }
        }
      }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text(`Product Inventory & Request Report — ${periodText}`, marginLeft, pageHeight - 20);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
    }

    const periodTag =
      (yearFilter === 'ALL' ? 'AllYears' : yearFilter) + '_' +
      (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter) + '_' +
      (monthFilter === 'ALL' ? 'AllM' : 'M' + monthFilter);
    doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
        <button
          onClick={exportToPDF}
          style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
        >
          Export to PDF
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
          Auto-refresh (15s)
        </label>

        {lastUpdated && (
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>Report Period:</strong>
        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={quarterFilter} onChange={(e) => setQuarterFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Quarters</option>
          <option value="1">Q1 (Jan – Mar)</option>
          <option value="2">Q2 (Apr – Jun)</option>
          <option value="3">Q3 (Jul – Sep)</option>
          <option value="4">Q4 (Oct – Dec)</option>
        </select>

        <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} style={selectStyle}>
          <option value="ALL">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <button
          onClick={() => { setYearFilter(String(new Date().getFullYear())); setQuarterFilter('ALL'); setMonthFilter('ALL'); }}
          style={{ padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
        >
          This Year
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Total Products */}
          <div style={{ flex: 1, minWidth: '150px', padding: '20px', backgroundColor: '#dbeafe', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '180px' }}>
            <h3 style={{ margin: 0, color: '#1e40af', fontSize: '14px' }}>Total Products</h3>
            <p style={{ fontSize: '24px', margin: '10px 0', color: '#1e40af' }}>{totalProductCount}</p>
          </div>

          {/* In Stock */}
          <div style={{ flex: 1, minWidth: '150px', padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '180px' }}>
            <h3 style={{ margin: 0, color: '#166534', fontSize: '14px' }}>In Stock</h3>
            <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
          </div>

          {/* Out of Stock */}
          <div style={{ flex: 1, minWidth: '150px', padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '180px' }}>
            <h3 style={{ margin: 0, color: '#b91c1c', fontSize: '14px' }}>Out of Stock</h3>
            <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
          </div>

          {/* Total Stock Qty */}
          <div style={{ flex: 1, minWidth: '150px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '180px' }}>
            <h3 style={{ margin: 0, color: '#334155', fontSize: '14px' }}>Total Stock Qty</h3>
            <p style={{ fontSize: '24px', margin: '10px 0', color: '#334155' }}>{totalStockQty}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ================================================================
// ==================== SUPER ADMIN DASHBOARD =====================
// ================================================================
const SuperAdminDashboard = () => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [downloadingType, setDownloadingType] = useState(null);
  const [reportError, setReportError] = useState('');
  const [reportKind, setReportKind] = useState('products');

  const [showInventoryReport, setShowInventoryReport] = useState(false);

  // ✅ Departments cache (for resolving departmentId → departmentName)
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(DEPARTMENTS_ENDPOINT, { headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data)) setDepartments(data);
      } catch (_) {
        // silent — falls back to "Dept #<id>" if unavailable
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ✅ Map: "<id>" -> "Department Name"
  const deptMap = useMemo(() => {
    const m = new Map();
    departments.forEach(d => {
      const id =
        d.departmentId ?? d.departmentID ?? d.id ?? d.deptId ?? null;
      const name =
        d.departmentName ?? d.departmentname ?? d.name ?? d.deptName ?? null;
      if (id != null && name != null) m.set(String(id), name);
    });
    return m;
  }, [departments]);

  // ✅ Resolve department display name from any shape
  const resolveDeptName = (u) => {
    if (!u) return '-';

    if (typeof u.departmentName === 'string' && u.departmentName.trim()) {
      return u.departmentName;
    }

    if (u.department && typeof u.department === 'object') {
      const directName =
        u.department.departmentName ??
        u.department.departmentname ??
        u.department.name ??
        u.department.deptName;
      if (directName) return directName;

      const deptId =
        u.department.departmentId ??
        u.department.departmentID ??
        u.department.id ??
        u.department.deptId;
      if (deptId != null && deptMap.has(String(deptId))) {
        return deptMap.get(String(deptId));
      }
      if (deptId != null) return `Dept #${deptId}`;
    }

    if (u.department != null) {
      const asStr = String(u.department);
      if (deptMap.has(asStr)) return deptMap.get(asStr);
      if (!/^\d+$/.test(asStr)) return asStr;
      return `Dept #${asStr}`;
    }

    const topId = u.departmentId ?? u.departmentID ?? u.deptId;
    if (topId != null) {
      if (deptMap.has(String(topId))) return deptMap.get(String(topId));
      return `Dept #${topId}`;
    }

    return '-';
  };

  // ✅ Robust text helper — never return undefined/null
  const txt = (v, fallback = '-') =>
    v === null || v === undefined || v === '' ? fallback : v;

  // ✅ Robust date helper — formats ISO date to yyyy-mm-dd, or '-'
  const fmtDate = (v) => {
    if (!v) return '-';
    try {
      const s = String(v);
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      const d = new Date(v);
      if (isNaN(d.getTime())) return s;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return String(v);
    }
  };

  // ✅ Merge product + request into the full row for the Products Report
  const buildFullProductRows = (productsData, requestsData) => {
    const requestMap = new Map();
    (requestsData || []).forEach(req => {
      const pid = req?.product?.productId;
      if (pid != null) requestMap.set(String(pid), req);
    });

    return (productsData || []).map(prod => {
      const req = requestMap.get(String(prod.productId));
      const requestStatus = req?.status ?? 'AVAILABLE';
      const productQty = Number(prod.productQuantity) || 0;
      const requestedQty = Number(req?.quantity) || 0;

      // ✅ Remaining stock: subtract only when APPROVED
      const remainingStock =
        requestStatus === 'APPROVED'
          ? productQty - requestedQty
          : productQty;

      const stockStatus = remainingStock > 0 ? 'In Stock' : 'Out of Stock';

      // Department name — try request first, then product.departmentId lookup
      let deptName = req?.departmentName;
      if (!deptName && prod.departmentId != null && deptMap.has(String(prod.departmentId))) {
        deptName = deptMap.get(String(prod.departmentId));
      }
      if (!deptName && prod.departmentId != null) {
        deptName = `Dept #${prod.departmentId}`;
      }
      if (!deptName) deptName = '-';

      return {
        id: prod.productId ?? '-',
        productName: txt(prod.productName),
        productDescription: txt(prod.productDescription),
        qtyReq: txt(req?.quantity),
        productQuantity: txt(prod.productQuantity, '0'),
        remainingStock,
        departmentName: deptName,
        supplierName: txt(prod.supplierName),
        receiptVoucherNo: txt(prod.receiptVoucherNo),
        price: prod.price != null ? Number(prod.price).toLocaleString() : '-',
        balance: prod.balance != null ? Number(prod.balance).toLocaleString() : '-',
        receiptDate: fmtDate(prod.receiptDate),
        issueDate: fmtDate(prod.issueDate),
        staffDesc: txt(req?.description),
        adminNote: txt(req?.adminNote),
        status: requestStatus,
        stockStatus,
      };
    });
  };

  // ============ PRODUCTS PDF ============
  const generateProductsPdf = (rows) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 20;
    const marginRight = 20;
    const tableWidth = pageWidth - marginLeft - marginRight;

    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('All Products Report', marginLeft, 36);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, marginLeft, 52);

    autoTable(doc, {
      startY: 64,
      tableWidth,
      theme: 'grid',
      head: [[
        'ID',
        'Product Name',
        'Description',
        'Qty Req',
        'Product Qty',
        'Remaining',
        'Department Name',
        'Supplier',
        'Voucher No',
        'Price',
        'Balance',
        'Receipt Date',
        'Issue Date',
        'Staff Desc',
        'Admin Note',
        'Status',
        'Stock Status'
      ]],
      body: rows.map(r => [
        { content: String(r.id), styles: { halign: 'center' } },
        r.productName,
        r.productDescription,
        { content: String(r.qtyReq), styles: { halign: 'center', fontStyle: 'bold' } },
        { content: String(r.productQuantity), styles: { halign: 'center', fontStyle: 'bold' } },
        {
          content: String(r.remainingStock ?? '-'),
          styles: {
            halign: 'center', fontStyle: 'bold',
            textColor: r.remainingStock > 0 ? [22, 101, 52] : [185, 28, 28]
          }
        },
        r.departmentName,
        r.supplierName,
        r.receiptVoucherNo,
        { content: String(r.price), styles: { halign: 'right' } },
        { content: String(r.balance), styles: { halign: 'right' } },
        { content: r.receiptDate, styles: { halign: 'center' } },
        { content: r.issueDate, styles: { halign: 'center' } },
        r.staffDesc,
        r.adminNote,
        { content: r.status, styles: { halign: 'center', fontStyle: 'bold' } },
        { content: r.stockStatus, styles: { halign: 'center', fontStyle: 'bold' } },
      ]),
      styles: {
        fontSize: 7,
        cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
        overflow: 'linebreak',
        valign: 'middle',
        lineColor: [226, 232, 240],
        lineWidth: 0.5,
        textColor: [30, 41, 59],
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 7,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0:  { cellWidth: 26, halign: 'center' },
        1:  { cellWidth: 55, halign: 'left', fontStyle: 'bold' },
        2:  { cellWidth: 65, halign: 'left' },
        3:  { cellWidth: 32, halign: 'center' },
        4:  { cellWidth: 40, halign: 'center' },
        5:  { cellWidth: 42, halign: 'center' },
        6:  { cellWidth: 55, halign: 'left' },
        7:  { cellWidth: 50, halign: 'left' },
        8:  { cellWidth: 50, halign: 'left' },
        9:  { cellWidth: 36, halign: 'right' },
        10: { cellWidth: 38, halign: 'right' },
        11: { cellWidth: 52, halign: 'center' },
        12: { cellWidth: 48, halign: 'center' },
        13: { cellWidth: 60, halign: 'left' },
        14: { cellWidth: 60, halign: 'left' },
        15: { cellWidth: 50, halign: 'center' },
        16: { cellWidth: 50, halign: 'center' },
      },
      margin: { left: marginLeft, right: marginRight },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Remaining column (index 5)
          if (data.column.index === 5) {
            const v = Number(data.cell.raw);
            if (!isNaN(v) && v > 0) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fillColor = [240, 253, 244];
            } else if (!isNaN(v)) {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 242, 242];
            }
          }

          // Status column (index 15)
          if (data.column.index === 15) {
            const v = data.cell.raw;
            if (v === 'APPROVED') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fillColor = [240, 253, 244];
            } else if (v === 'REJECTED') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 242, 242];
            } else if (v === 'PENDING') {
              data.cell.styles.textColor = [146, 64, 14];
              data.cell.styles.fillColor = [255, 251, 235];
            } else if (v === 'CHECKED') {
              data.cell.styles.textColor = [109, 40, 217];
              data.cell.styles.fillColor = [237, 233, 254];
            } else if (v === 'COMPLETED') {
              data.cell.styles.textColor = [30, 64, 175];
              data.cell.styles.fillColor = [219, 234, 254];
            }
          }

          // Stock Status column (index 16)
          if (data.column.index === 16) {
            const v = data.cell.raw;
            if (v === 'In Stock') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fillColor = [220, 252, 231];
            } else if (v === 'Out of Stock') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fillColor = [254, 226, 226];
            }
          }
        }
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120);
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.text('All Products Report', marginLeft, pageHeight - 20);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - marginRight - 60, pageHeight - 20);
    }

    doc.save(`products-report-${Date.now()}.pdf`);
  };

  // ============ PRODUCTS EXCEL ============
  const generateProductsExcel = (rows) => {
    const data = rows.map(r => ({
      ID: r.id,
      'Product Name': r.productName,
      Description: r.productDescription,
      'Qty Req': r.qtyReq,
      'Product Qty': r.productQuantity,
      Remaining: r.remainingStock,
      'Department Name': r.departmentName,
      Supplier: r.supplierName,
      'Voucher No': r.receiptVoucherNo,
      Price: r.price,
      Balance: r.balance,
      'Receipt Date': r.receiptDate,
      'Issue Date': r.issueDate,
      'Staff Desc': r.staffDesc,
      'Admin Note': r.adminNote,
      Status: r.status,
      'Stock Status': r.stockStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [
      { wch: 6 },  // ID
      { wch: 24 }, // Product Name
      { wch: 32 }, // Description
      { wch: 8 },  // Qty Req
      { wch: 11 }, // Product Qty
      { wch: 11 }, // Remaining
      { wch: 22 }, // Department Name
      { wch: 22 }, // Supplier
      { wch: 18 }, // Voucher No
      { wch: 12 }, // Price
      { wch: 12 }, // Balance
      { wch: 14 }, // Receipt Date
      { wch: 14 }, // Issue Date
      { wch: 28 }, // Staff Desc
      { wch: 28 }, // Admin Note
      { wch: 14 }, // Status
      { wch: 14 }, // Stock Status
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    XLSX.writeFile(workbook, `products-report-${Date.now()}.xlsx`);
  };

  // ============ USERS PDF / EXCEL ============
  const generateUsersPdf = (userList) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('System Users Report', 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 24);

    const columns = [
      { header: 'Department Name', dataKey: 'department' },
      { header: 'Username', dataKey: 'username' },
      { header: 'Email', dataKey: 'email' },
      { header: 'Gender', dataKey: 'gender' },
      { header: 'Phone', dataKey: 'phone' },
      { header: 'Role', dataKey: 'role' },
    ];
    const rows = userList.map((u) => ({
      username: u.userName ?? u.username ?? '',
      email: u.email ?? '',
      gender: u.gender ?? '',
      phone: u.phoneNumber ?? u.phone ?? '',
      role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
      department: resolveDeptName(u),
    }));

    autoTable(doc, {
      columns, body: rows, startY: 30,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 243, 255] },
      margin: { left: 10, right: 10 },
    });
    doc.save(`users-report-${Date.now()}.pdf`);
  };

  const generateUsersExcel = (userList) => {
    const data = userList.map((u) => ({
      'Department Name': resolveDeptName(u),
      Username: u.userName ?? u.username ?? '',
      Email: u.email ?? '',
      Gender: u.gender ?? '',
      Phone: u.phoneNumber ?? u.phone ?? '',
      Role: u.role?.roleName ?? u.role?.name ?? u.role ?? '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = [{ wch: 22 }, { wch: 25 }, { wch: 30 }, { wch: 10 }, { wch: 16 }, { wch: 16 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users-report-${Date.now()}.xlsx`);
  };

  // ============ DOWNLOAD HANDLER ============
  const handleDownloadReport = async (type) => {
    setDownloadingType(type);
    setReportError('');
    try {
      const isUsers = reportKind === 'users';

      // Make sure we have the departments cached (for department name lookup)
      if (deptMap.size === 0) {
        try {
          const dRes = await fetch(DEPARTMENTS_ENDPOINT, { headers: { Accept: 'application/json' } });
          if (dRes.ok) {
            const dData = await dRes.json();
            if (Array.isArray(dData)) setDepartments(dData);
          }
        } catch (_) { /* ignore */ }
      }

      if (isUsers) {
        const response = await fetch(USERS_ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' } });
        if (!response.ok) {
          let errorMsg = `Server responded with ${response.status}`;
          try { const errText = await response.text(); if (errText) errorMsg = errText; } catch (_) {}
          throw new Error(errorMsg);
        }
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('No data available to export.');
        if (type === 'pdf') generateUsersPdf(data); else generateUsersExcel(data);
      } else {
        // ✅ Products report — fetch products AND requests, then merge
        const [prodRes, reqRes] = await Promise.all([
          fetch(PRODUCTS_ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' } }),
          fetch(REQUESTS_ENDPOINT, { method: 'GET', headers: { Accept: 'application/json' } }),
        ]);
        if (!prodRes.ok) throw new Error(`Products endpoint responded with ${prodRes.status}`);
        const productsData = await prodRes.json();
        const requestsData = reqRes.ok ? await reqRes.json() : [];
        if (!Array.isArray(productsData) || productsData.length === 0) {
          throw new Error('No products available to export.');
        }
        const rows = buildFullProductRows(productsData, requestsData);
        if (type === 'pdf') generateProductsPdf(rows); else generateProductsExcel(rows);
      }

      setShowReportOptions(false);
    } catch (error) {
      console.error('Error downloading report:', error);
      setReportError(
        error.message === 'Failed to fetch'
          ? 'Cannot reach the server. Make sure the backend is running and the proxy is configured.'
          : error.message
      );
    } finally {
      setDownloadingType(null);
    }
  };

  const cards = [
    {
      title: 'All Products Report',
      icon: '📦',
      description: 'Download a full report of all registered products.',
      color: '#3b82f6',
      actions: [{ label: 'Download Product Report', type: 'report', kind: 'products' }],
    },
    {
      title: 'System Users',
      icon: '👥',
      description: 'Download a report of all registered users across every department.',
      color: '#8b5cf6',
      actions: [{ label: 'Download Users Report', type: 'report', kind: 'users' }],
    },
    {
      title: 'Product Inventory & Request Report',
      icon: '📊',
      description: 'Pick a period and export the full inventory PDF report.',
      color: '#0ea5e9',
      actions: [{ label: 'Open Inventory Report', type: 'inventory' }],
    },
  ];

  const handleAction = (action) => {
    if (action.type === 'report') {
      setReportError('');
      setReportKind(action.kind || 'products');
      setShowReportOptions(true);
    } else if (action.type === 'inventory') {
      setShowInventoryReport(true);
    } else if (action.path) {
      window.location.href = action.path;
    }
  };

  const modalOverlay = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  };
  const modalContent = {
    backgroundColor: '#fff', borderRadius: '12px', padding: '30px',
    maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  };
  const closeButton = {
    marginTop: '20px', padding: '10px 24px', border: 'none', borderRadius: '7px',
    backgroundColor: '#e2e8f0', color: '#1e293b', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer',
  };

  const isUsersReport = reportKind === 'users';
  const reportTitle = isUsersReport ? 'Download Users Report' : 'Download Product Report';
  const reportAccent = isUsersReport ? '#8b5cf6' : '#3b82f6';

  return (
    <div style={{ padding: '30px' }}>
      <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 15 }}>
        Welcome, Super Admin — Full System Control
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px',
              border: '1px solid #e2e8f0', borderLeft: `5px solid ${card.color}`,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'; }}
          >
            <div style={{ width: '55px', height: '55px', borderRadius: '10px', backgroundColor: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', marginBottom: '18px' }}>
              {card.icon}
            </div>
            <h2 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '20px' }}>{card.title}</h2>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {card.actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleAction(action)}
                  style={{ width: '100%', padding: '11px 15px', border: 'none', borderRadius: '7px', backgroundColor: card.color, color: '#ffffff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                  {action.label} →
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showInventoryReport && (
        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, color: '#0f172a' }}>Product Inventory & Request Report</h2>
            <button
              onClick={() => setShowInventoryReport(false)}
              style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
            >
              Close ✕
            </button>
          </div>
          <ProductInventoryReport />
        </div>
      )}

      {showReportOptions && (
        <div style={modalOverlay} onClick={() => !downloadingType && setShowReportOptions(false)}>
          <div style={modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#1e293b' }}>📄 {reportTitle}</h2>
            <p style={{ color: '#64748b', marginBottom: '20px' }}>Choose the format you want to download:</p>

            {reportError && (
              <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '12px 15px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {reportError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingType === 'pdf'}
                style={{
                  flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
                  background: downloadingType === 'pdf' ? '#f87171' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: downloadingType === 'pdf' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{downloadingType === 'pdf' ? '⏳' : '📄'}</span>
                {downloadingType === 'pdf' ? 'Downloading...' : 'Download PDF'}
              </button>

              <button
                onClick={() => handleDownloadReport('excel')}
                disabled={downloadingType === 'excel'}
                style={{
                  flex: 1, minWidth: '160px', padding: '20px', border: 'none', borderRadius: '10px',
                  background: downloadingType === 'excel' ? '#4ade80' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: '#fff', fontSize: '15px', fontWeight: '700',
                  cursor: downloadingType === 'excel' ? 'wait' : 'pointer',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{downloadingType === 'excel' ? '⏳' : '📊'}</span>
                {downloadingType === 'excel' ? 'Downloading...' : 'Download Excel'}
              </button>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button style={{ ...closeButton, borderTop: `3px solid ${reportAccent}` }} onClick={() => setShowReportOptions(false)} disabled={!!downloadingType}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const selectStyle = { padding: '8px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', backgroundColor: '#fff', cursor: 'pointer' };

export default SuperAdminDashboard;