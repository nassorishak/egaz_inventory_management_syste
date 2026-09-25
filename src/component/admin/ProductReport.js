// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const ProductReport = () => {
//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showDepartmentUsage, setShowDepartmentUsage] = useState(false);
//   const [departmentUsage, setDepartmentUsage] = useState({});
//   const [expandedDept, setExpandedDept] = useState(null);

//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [stockFilter, setStockFilter] = useState('ALL');
//   const [deptFilter, setDeptFilter] = useState('ALL');
//   const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
//   const [quarterFilter, setQuarterFilter] = useState('ALL');

//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const REFRESH_INTERVAL = 15000;

//   useEffect(() => {
//     fetchData();
//   }, []);

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
//         fetch('http://localhost:8080/api/products/all'),
//         fetch('http://localhost:8080/api/product-requests/all')
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
//           requestQuantity: req?.quantity ?? '-',
//           adminNote: req?.adminNote ?? '-',
//           description: req?.description ?? '-',
//           status: requestStatus,
//           departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
//           productDescription: prod.productDescription ?? '-',
//           stockStatus,
//           requestedProductName: req?.product?.productName ?? '-',
//           receiptVoucherNo: prod.receiptVoucherNo ?? '-',
//           supplierName: prod.supplierName ?? '-',
//           balance: prod.balance ?? '-',
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
//     const set = new Set();
//     products.forEach(p => {
//       const y = getYear(getFilterDate(p));
//       if (y) set.add(y);
//     });
//     set.add(new Date().getFullYear());
//     return Array.from(set).sort((a, b) => b - a);
//   }, [products]);

//   const matchesPeriod = (item) => {
//     const d = getFilterDate(item);
//     if (!d) return yearFilter === 'ALL' && quarterFilter === 'ALL';

//     if (yearFilter !== 'ALL') {
//       if (getYear(d) !== Number(yearFilter)) return false;
//     }
//     if (quarterFilter !== 'ALL') {
//       if (getQuarter(d) !== Number(quarterFilter)) return false;
//     }
//     return true;
//   };

//   const periodProducts = useMemo(
//     () => products.filter(matchesPeriod),
//     [products, yearFilter, quarterFilter]
//   );

//   const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
//   const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

//   const departments = useMemo(() => {
//     const set = new Set(periodProducts.map(p => p.departmentName).filter(Boolean));
//     return Array.from(set).sort();
//   }, [periodProducts]);

//   const filteredProducts = useMemo(() => {
//     return periodProducts.filter(p => {
//       const searchMatch =
//         !search ||
//         (p.productName || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.productDescription || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.departmentName || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.supplierName || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.receiptVoucherNo || '').toLowerCase().includes(search.toLowerCase());

//       const statusMatch = statusFilter === 'ALL' || p.status === statusFilter;
//       const stockMatch = stockFilter === 'ALL' || p.stockStatus === stockFilter;
//       const deptMatch = deptFilter === 'ALL' || p.departmentName === deptFilter;

//       return searchMatch && statusMatch && stockMatch && deptMatch;
//     });
//   }, [periodProducts, search, statusFilter, stockFilter, deptFilter]);

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

//   const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(1);
//   }, [totalPages, currentPage]);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filteredProducts.slice(start, start + pageSize);
//   }, [filteredProducts, currentPage, pageSize]);

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

//     const filterSummary = [];
//     if (search) filterSummary.push(`Search: "${search}"`);
//     if (statusFilter !== 'ALL') filterSummary.push(`Admin Status: ${statusFilter}`);
//     if (stockFilter !== 'ALL') filterSummary.push(`Stock: ${stockFilter}`);
//     if (deptFilter !== 'ALL') filterSummary.push(`Department: ${deptFilter}`);

//     let y = 84;
//     if (filterSummary.length > 0) {
//       doc.setTextColor(100);
//       doc.text(`Filters: ${filterSummary.join('  |  ')}`, marginLeft, y);
//       y += 12;
//     }

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
//     doc.text(String(filteredProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
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
//               valign: 'middle',
//               halign: 'left',
//               fontStyle: 'bold',
//               textColor: [15, 23, 42],
//               fillColor: [241, 245, 249]
//             }
//           },
//           {
//             content: `Total Requests: ${items.length}`,
//             styles: {
//               fontStyle: 'bold',
//               halign: 'center',
//               textColor: [30, 64, 175],
//               fillColor: [219, 234, 254]
//             }
//           },
//           {
//             content: `Approved: ${approvedCount}`,
//             styles: {
//               fontStyle: 'bold',
//               halign: 'center',
//               textColor: [22, 101, 52],
//               fillColor: [220, 252, 231]
//             }
//           },
//           {
//             content: `Rejected: ${rejectedCount}`,
//             styles: {
//               fontStyle: 'bold',
//               halign: 'center',
//               textColor: [185, 28, 28],
//               fillColor: [254, 226, 226]
//             }
//           }
//         ]);

//         items.forEach(item => {
//           body.push([
//             { content: item.productName, styles: { halign: 'left' } },
//             { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
//             {
//               content: item.status,
//               styles: {
//                 halign: 'center',
//                 fontStyle: 'bold',
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
//         body: body,
//         theme: 'grid',
//         styles: {
//           fontSize: 9,
//           cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
//           overflow: 'linebreak',
//           valign: 'middle',
//           lineColor: [203, 213, 225],
//           lineWidth: 0.5,
//           textColor: [30, 41, 59]
//         },
//         headStyles: {
//           fillColor: [30, 64, 175],
//           textColor: 255,
//           fontStyle: 'bold',
//           valign: 'middle',
//           fontSize: 9
//         },
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
//         'ProductName',
//         'Description',
//         'PQty',
//         'RequestQty',
//         'Department',
//         'Supplier',
//         'Receipt VoucherNo',
//         'Price',
//         'Balance',
//         'Receipt Date',
//         'Issue Date',
//         'Staff Description',
//         'AdminNote',
//         'AdminStatus',
//         'StockStatus'
//       ]],
//       body: filteredProducts.map(p => [
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
//         2:  { cellWidth: 40, halign: 'center' },
//         3:  { cellWidth: 50, halign: 'center' },
//         4:  { cellWidth: 55, halign: 'left' },
//         5:  { cellWidth: 55, halign: 'left' },
//         6:  { cellWidth: 74, halign: 'left' },
//         7:  { cellWidth: 35, halign: 'right' },
//         8:  { cellWidth: 40, halign: 'right' },
//         9:  { cellWidth: 50, halign: 'center' },
//         10: { cellWidth: 50, halign: 'center' },
//         11: { cellWidth: 70, halign: 'left' },
//         12: { cellWidth: 70, halign: 'left' },
//         13: { cellWidth: 50, halign: 'center' },
//         14: { cellWidth: 48, halign: 'center' }
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
//       (yearFilter === 'ALL' ? 'AllYears' : yearFilter) +
//       '_' +
//       (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter);
//     doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   const toggleDept = (dept) => {
//     setExpandedDept(expandedDept === dept ? null : dept);
//   };

//   const badgeStyle = (status) => {
//     const map = {
//       APPROVED: { bg: '#dcfce7', color: '#166534' },
//       REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
//       PENDING: { bg: '#fef3c7', color: '#92400e' },
//       AVAILABLE: { bg: '#dbeafe', color: '#1e40af' },
//     };
//     const c = map[status] || { bg: '#e2e8f0', color: '#334155' };
//     return {
//       padding: '3px 8px',
//       borderRadius: '12px',
//       fontSize: '11px',
//       fontWeight: '600',
//       backgroundColor: c.bg,
//       color: c.color,
//       whiteSpace: 'nowrap'
//     };
//   };

//   return (
//     <div style={{
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif',
//       height: '100%',
//       display: 'flex',
//       flexDirection: 'column',
//       boxSizing: 'border-box',
//       minHeight: 0,
//       overflow: 'hidden',
//     }}>
//       <h2 style={{ marginTop: 0 }}>Product Inventory & Request Report</h2>

//       {/* Top bar */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px', flexShrink: 0 }}>
//         <button
//           style={{
//             padding: '8px 16px',
//             backgroundColor: '#3b82f6',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//           onClick={() => setShowDepartmentUsage(!showDepartmentUsage)}
//         >
//           {showDepartmentUsage ? 'Hide' : 'Show'} Department Usage
//         </button>

//         <button
//           onClick={exportToPDF}
//           style={{
//             padding: '8px 16px',
//             backgroundColor: '#dc2626',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Export to PDF
//         </button>

//         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
//           <input
//             type="checkbox"
//             checked={autoRefresh}
//             onChange={(e) => setAutoRefresh(e.target.checked)}
//           />
//           Auto-refresh (15s)
//         </label>

//         {lastUpdated && (
//           <span style={{ fontSize: '12px', color: '#64748b' }}>
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//       </div>

//       {/* Period Filter Bar */}
//       <div style={{
//         display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px',
//         padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px',
//         border: '1px solid #bfdbfe',
//         flexShrink: 0
//       }}>
//         <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>
//           Report Period:
//         </strong>

//         <select
//           value={yearFilter}
//           onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
//           style={selectStyle}
//         >
//           <option value="ALL">All Years</option>
//           {years.map(y => (
//             <option key={y} value={y}>{y}</option>
//           ))}
//         </select>

//         <select
//           value={quarterFilter}
//           onChange={(e) => { setQuarterFilter(e.target.value); setCurrentPage(1); }}
//           style={selectStyle}
//         >
          
//           <option value="ALL">All Quarters</option>
//           <option value="1">Q1 (Jan – Mar)</option>
//           <option value="2">Q2 (Apr – Jun)</option>
//           <option value="3">Q3 (Jul – Sep)</option>
//           <option value="4">Q4 (Oct – Dec)</option>
//         </select>

//         <button
//           onClick={() => {
//             setYearFilter(String(new Date().getFullYear()));
//             setQuarterFilter('ALL');
//             setCurrentPage(1);
//           }}
//           style={{
//             padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af',
//             border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
//           }}
//         >
//           This Year
//         </button>
//       </div>

//       {/* Department Usage Panel */}
//       {showDepartmentUsage && (
//         <div style={{
//           marginBottom: '20px',
//           padding: '16px',
//           backgroundColor: '#f0f4f8',
//           borderRadius: '8px',
//           border: '1px solid #cbd5e1',
//           maxHeight: '300px',
//           overflowY: 'auto',
//           flexShrink: 0
//         }}>
//           <h3 style={{ marginTop: 0 }}>Department-wise Usage (Approved / Rejected)</h3>

//           {Object.keys(departmentUsage).length === 0 ? (
//             <p style={{ color: '#64748b' }}>No approved or rejected requests for this period.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {Object.keys(departmentUsage).map((dept) => {
//                 const items = departmentUsage[dept];
//                 const isOpen = expandedDept === dept;
//                 const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//                 const rejectedCount = items.filter(i => i.status === 'REJECTED').length;
//                 return (
//                   <div
//                     key={dept}
//                     style={{
//                       backgroundColor: '#fff',
//                       borderRadius: '6px',
//                       border: '1px solid #e2e8f0',
//                       overflow: 'hidden'
//                     }}
//                   >
//                     <div
//                       onClick={() => toggleDept(dept)}
//                       style={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         padding: '12px 16px',
//                         cursor: 'pointer',
//                         backgroundColor: isOpen ? '#e0e7ff' : '#f8fafc'
//                       }}
//                     >
//                       <span style={{ fontWeight: '600', color: '#1e293b' }}>{dept}</span>
//                       <span style={{ fontSize: '13px', color: '#64748b' }}>
//                         {items.length} request{items.length !== 1 ? 's' : ''}
//                         <span style={{ marginLeft: '10px', color: '#166534', fontWeight: 600 }}>
//                           ✓ {approvedCount}
//                         </span>
//                         <span style={{ marginLeft: '8px', color: '#b91c1c', fontWeight: 600 }}>
//                           ✗ {rejectedCount}
//                         </span>
//                         <span style={{ marginLeft: '10px' }}>{isOpen ? '▲' : '▼'}</span>
//                       </span>
//                     </div>

//                     {isOpen && (
//                       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                         <thead>
//                           <tr>
//                             <th style={deptThStyle}>Product Name</th>
//                             <th style={deptThStyle}>Quantity</th>
//                             <th style={deptThStyle}>Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {items.map((item, i) => (
//                             <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
//                               <td style={deptTdStyle}>{item.productName}</td>
//                               <td style={{ ...deptTdStyle, fontWeight: '600' }}>{item.qty}</td>
//                               <td style={deptTdStyle}>
//                                 <span style={badgeStyle(item.status)}>{item.status}</span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Stock Status Cards */}
//       <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexShrink: 0 }}>
//         <div style={{
//           flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px',
//           boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px'
//         }}>
//           <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
//           <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
//         </div>
//         <div style={{
//           flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px',
//           boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px'
//         }}>
//           <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
//           <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
//         </div>
//       </div>

//       {/* Filter bar */}
//       <div style={{
//         display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px',
//         padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px',
//         border: '1px solid #e2e8f0',
//         flexShrink: 0
//       }}>
//         <input
//           type="text"
//           placeholder="Search product / description / department / supplier / voucher..."
//           value={search}
//           onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
//           style={{
//             flex: '1 1 240px', padding: '8px 12px', border: '1px solid #cbd5e1',
//             borderRadius: '6px', fontSize: '13px', outline: 'none'
//           }}
//         />

//         <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Admin Status</option>
//           <option value="APPROVED">APPROVED</option>
//           <option value="REJECTED">REJECTED</option>
//           <option value="PENDING">PENDING</option>
//           <option value="AVAILABLE">AVAILABLE</option>
//         </select>

//         <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Stock Status</option>
//           <option value="In Stock">In Stock</option>
//           <option value="Out of Stock">Out of Stock</option>
//         </select>

//         <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Departments</option>
//           {departments.map(d => (
//             <option key={d} value={d}>{d}</option>
//           ))}
//         </select>

//         <button
//           onClick={() => {
//             setSearch('');
//             setStatusFilter('ALL');
//             setStockFilter('ALL');
//             setDeptFilter('ALL');
//             setCurrentPage(1);
//           }}
//           style={{
//             padding: '8px 14px', backgroundColor: '#e2e8f0', color: '#334155',
//             border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
//           }}
//         >
//           Clear
//         </button>
//       </div>

//       {/* Data Table */}
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <div style={{
//           flex: 1,
//           minHeight: 0,
//           display: 'flex',
//           flexDirection: 'column',
//         }}>
//           <div style={{
//             flex: 1,
//             minHeight: 0,
//             overflow: 'auto',
//             border: '1px solid #e2e8f0',
//             borderRadius: '8px',
//             backgroundColor: '#fff',
//           }}>
//             <table style={{
//               width: '100%',
//               borderCollapse: 'collapse',
//               tableLayout: 'fixed',
//               fontSize: '12px'
//             }}>
//               {/* ✅ Column widths tuned for readability with wrapping */}
//               <colgroup>
//                 <col style={{ width: '11%' }} />
//                 <col style={{ width: '12%' }} />
//                 <col style={{ width: '5%' }} />
//                 <col style={{ width: '10%' }} />
//                 <col style={{ width: '8%' }} />
//                 <col style={{ width: '8%' }} />
//                 <col style={{ width: '9%' }} />
//                 <col style={{ width: '6%' }} />
//                 <col style={{ width: '6%' }} />
//                 <col style={{ width: '10%' }} />
//                 <col style={{ width: '7%' }} />
//                 <col style={{ width: '11%' }} />
//                 <col style={{ width: '15%' }} />
//                 <col style={{ width: '10%' }} />
//                 <col style={{ width: '12%' }} />
//               </colgroup>
//               <thead>
//                 <tr>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>ProductName</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>PDescription</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>PQty</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Req Qty</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Dept</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Supplier</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Voucher No</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Price</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Balance</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Receiptdate</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Issuedate</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Staff Desc</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Admin Note</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Status</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Stock Stock</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedProducts.length === 0 ? (
//                   <tr>
//                     <td colSpan="15" style={{ padding: '20px', textAlign: 'center' }}>
//                       No products match your filters.
//                     </td>
//                   </tr>
//                 ) : (
//                   paginatedProducts.map((p) => (
//                     <tr key={p.productId} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                       <td style={cellStyle}>{p.productName || '-'}</td>
//                       <td style={cellStyle}>{p.productDescription ?? '-'}</td>
//                       <td style={{ ...cellStyle, fontWeight: '600', color: '#1e40af', textAlign: 'center' }}>
//                         {p.productQuantity ?? '0'}
//                       </td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>{p.requestQuantity ?? '-'}</td>
//                       <td style={cellStyle}>{p.departmentName}</td>
//                       <td style={cellStyle}>{p.supplierName ?? '-'}</td>
//                       <td style={cellStyle}>{p.receiptVoucherNo ?? '-'}</td>
//                       <td style={{ ...cellStyle, textAlign: 'right' }}>
//                         {p.price != null ? Number(p.price).toLocaleString() : '-'}
//                       </td>
//                       <td style={{
//                         ...cellStyle,
//                         fontWeight: '600',
//                         textAlign: 'right',
//                         color: Number(p.balance) > 0 ? '#166534' : '#b91c1c'
//                       }}>
//                         {p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-'}
//                       </td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>{p.receiptDate ?? '-'}</td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>{p.issueDate ?? '-'}</td>
//                       <td style={cellStyle}>{p.description ?? '-'}</td>
//                       <td style={cellStyle}>{p.adminNote ?? '-'}</td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>
//                         <span style={badgeStyle(p.status)}>{p.status ?? 'AVAILABLE'}</span>
//                       </td>
//                       <td style={{
//                         ...cellStyle,
//                         fontWeight: 'bold',
//                         textAlign: 'center',
//                         color: p.stockStatus === 'In Stock' ? '#166534' : '#b91c1c'
//                       }}>
//                         {p.stockStatus}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div style={{
//             display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
//             alignItems: 'center', gap: '10px', marginTop: '15px',
//             fontSize: '13px', color: '#475569',
//             flexShrink: 0
//           }}>
//             <div>
//               Showing{' '}
//               <strong>{filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong>{' '}
//               – <strong>{Math.min(currentPage * pageSize, filteredProducts.length)}</strong>{' '}
//               of <strong>{filteredProducts.length}</strong> results
//             </div>

//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <label>
//                 Rows:
//                 <select
//                   value={pageSize}
//                   onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
//                   style={{ marginLeft: '6px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                 </select>
//               </label>

//               <button
//                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 style={pageBtnStyle(currentPage === 1)}
//               >
//                 Prev
//               </button>

//               <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>

//               <button
//                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 style={pageBtnStyle(currentPage === totalPages)}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const headerStyle = {
//   padding: '10px 6px',
//   backgroundColor: '#1e40af',
//   color: '#fff',
//   textAlign: 'left',
//   fontSize: '11px',
//   fontWeight: '700',
//   whiteSpace: 'normal',
//   wordBreak: 'break-word',
//   verticalAlign: 'middle',
//   borderRight: '1px solid #3b5fbf'
// };

// /* ✅ KEY CHANGE: allow text to wrap so nothing is hidden */
// const cellStyle = {
//   padding: '10px 6px',
//   fontSize: '12px',
//   whiteSpace: 'normal',
//   wordBreak: 'break-word',
//   overflowWrap: 'anywhere',
//   verticalAlign: 'top',
//   color: '#1e293b'
// };

// const selectStyle = {
//   padding: '8px 10px',
//   border: '1px solid #cbd5e1',
//   borderRadius: '6px',
//   fontSize: '13px',
//   backgroundColor: '#fff',
//   cursor: 'pointer'
// };

// const deptThStyle = {
//   padding: '8px 16px',
//   textAlign: 'left',
//   fontSize: '12px',
//   color: '#475569',
//   textTransform: 'uppercase',
//   letterSpacing: '0.5px',
//   backgroundColor: '#f8fafc',
//   borderBottom: '1px solid #e2e8f0'
// };

// const deptTdStyle = {
//   padding: '10px 16px',
//   fontSize: '13px',
//   color: '#1e293b'
// };

// const pageBtnStyle = (disabled) => ({
//   padding: '6px 12px',
//   backgroundColor: disabled ? '#e2e8f0' : '#3b82f6',
//   color: disabled ? '#94a3b8' : '#fff',
//   border: 'none',
//   borderRadius: '4px',
//   cursor: disabled ? 'not-allowed' : 'pointer',
//   fontSize: '13px'
// });

// export default ProductReport;
// import React, { useState, useEffect, useMemo } from 'react';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';

// const ProductReport = () => {
//   const [products, setProducts] = useState([]);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showDepartmentUsage, setShowDepartmentUsage] = useState(false);
//   const [departmentUsage, setDepartmentUsage] = useState({});
//   const [expandedDept, setExpandedDept] = useState(null);

//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [stockFilter, setStockFilter] = useState('ALL');
//   const [deptFilter, setDeptFilter] = useState('ALL');
//   const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
//   const [quarterFilter, setQuarterFilter] = useState('ALL');
//   const [monthFilter, setMonthFilter] = useState('ALL'); // ✅ NEW

//   const [currentPage, setCurrentPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const [autoRefresh, setAutoRefresh] = useState(true);

//   const REFRESH_INTERVAL = 15000;

//   useEffect(() => {
//     fetchData();
//   }, []);

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
//         fetch('http://localhost:8080/api/products/all'),
//         fetch('http://localhost:8080/api/product-requests/all')
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
//           requestQuantity: req?.quantity ?? '-',
//           adminNote: req?.adminNote ?? '-',
//           description: req?.description ?? '-',
//           status: requestStatus,
//           departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
//           productDescription: prod.productDescription ?? '-',
//           stockStatus,
//           requestedProductName: req?.product?.productName ?? '-',
//           receiptVoucherNo: prod.receiptVoucherNo ?? '-',
//           supplierName: prod.supplierName ?? '-',
//           balance: prod.balance ?? '-',
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

//   // ✅ Always show current year + 2 previous years
//   const years = useMemo(() => {
//     const set = new Set();

//     products.forEach(p => {
//       const y = getYear(getFilterDate(p));
//       if (y) set.add(y);
//     });

//     const currentYear = new Date().getFullYear();
//     for (let i = 0; i < 3; i++) {
//       set.add(currentYear - i);
//     }

//     return Array.from(set).sort((a, b) => b - a);
//   }, [products]);

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

//   const departments = useMemo(() => {
//     const set = new Set(periodProducts.map(p => p.departmentName).filter(Boolean));
//     return Array.from(set).sort();
//   }, [periodProducts]);

//   const filteredProducts = useMemo(() => {
//     return periodProducts.filter(p => {
//       const searchMatch =
//         !search ||
//         (p.productName || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.productDescription || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.departmentName || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.supplierName || '').toLowerCase().includes(search.toLowerCase()) ||
//         (p.receiptVoucherNo || '').toLowerCase().includes(search.toLowerCase());

//       const statusMatch = statusFilter === 'ALL' || p.status === statusFilter;
//       const stockMatch = stockFilter === 'ALL' || p.stockStatus === stockFilter;
//       const deptMatch = deptFilter === 'ALL' || p.departmentName === deptFilter;

//       return searchMatch && statusMatch && stockMatch && deptMatch;
//     });
//   }, [periodProducts, search, statusFilter, stockFilter, deptFilter]);

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

//   const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
//   useEffect(() => {
//     if (currentPage > totalPages) setCurrentPage(1);
//   }, [totalPages, currentPage]);

//   const paginatedProducts = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     return filteredProducts.slice(start, start + pageSize);
//   }, [filteredProducts, currentPage, pageSize]);

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

//     // Build a readable period string that includes month when set
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

//     const filterSummary = [];
//     if (search) filterSummary.push(`Search: "${search}"`);
//     if (statusFilter !== 'ALL') filterSummary.push(`Admin Status: ${statusFilter}`);
//     if (stockFilter !== 'ALL') filterSummary.push(`Stock: ${stockFilter}`);
//     if (deptFilter !== 'ALL') filterSummary.push(`Department: ${deptFilter}`);

//     let y = 84;
//     if (filterSummary.length > 0) {
//       doc.setTextColor(100);
//       doc.text(`Filters: ${filterSummary.join('  |  ')}`, marginLeft, y);
//       y += 12;
//     }

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
//     doc.text(String(filteredProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
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
//               valign: 'middle',
//               halign: 'left',
//               fontStyle: 'bold',
//               textColor: [15, 23, 42],
//               fillColor: [241, 245, 249]
//             }
//           },
//           {
//             content: `Total Requests: ${items.length}`,
//             styles: {
//               fontStyle: 'bold',
//               halign: 'center',
//               textColor: [30, 64, 175],
//               fillColor: [219, 234, 254]
//             }
//           },
//           {
//             content: `Approved: ${approvedCount}`,
//             styles: {
//               fontStyle: 'bold',
//               halign: 'center',
//               textColor: [22, 101, 52],
//               fillColor: [220, 252, 231]
//             }
//           },
//           {
//             content: `Rejected: ${rejectedCount}`,
//             styles: {
//               fontStyle: 'bold',
//               halign: 'center',
//               textColor: [185, 28, 28],
//               fillColor: [254, 226, 226]
//             }
//           }
//         ]);

//         items.forEach(item => {
//           body.push([
//             { content: item.productName, styles: { halign: 'left' } },
//             { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
//             {
//               content: item.status,
//               styles: {
//                 halign: 'center',
//                 fontStyle: 'bold',
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
//         body: body,
//         theme: 'grid',
//         styles: {
//           fontSize: 9,
//           cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
//           overflow: 'linebreak',
//           valign: 'middle',
//           lineColor: [203, 213, 225],
//           lineWidth: 0.5,
//           textColor: [30, 41, 59]
//         },
//         headStyles: {
//           fillColor: [30, 64, 175],
//           textColor: 255,
//           fontStyle: 'bold',
//           valign: 'middle',
//           fontSize: 9
//         },
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
//         'ProductName',
//         'Description',
//         'PQty',
//         'RequestQty',
//         'Department',
//         'Supplier',
//         'Receipt VoucherNo',
//         'Price',
//         'Balance',
//         'Receipt Date',
//         'Issue Date',
//         'Staff Description',
//         'AdminNote',
//         'AdminStatus',
//         'StockStatus'
//       ]],
//       body: filteredProducts.map(p => [
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
//         2:  { cellWidth: 40, halign: 'center' },
//         3:  { cellWidth: 50, halign: 'center' },
//         4:  { cellWidth: 55, halign: 'left' },
//         5:  { cellWidth: 55, halign: 'left' },
//         6:  { cellWidth: 74, halign: 'left' },
//         7:  { cellWidth: 35, halign: 'right' },
//         8:  { cellWidth: 40, halign: 'right' },
//         9:  { cellWidth: 50, halign: 'center' },
//         10: { cellWidth: 50, halign: 'center' },
//         11: { cellWidth: 70, halign: 'left' },
//         12: { cellWidth: 70, halign: 'left' },
//         13: { cellWidth: 50, halign: 'center' },
//         14: { cellWidth: 48, halign: 'center' }
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
//       (yearFilter === 'ALL' ? 'AllYears' : yearFilter) +
//       '_' +
//       (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter) +
//       '_' +
//       (monthFilter === 'ALL' ? 'AllM' : 'M' + monthFilter);
//     doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
//   };

//   const toggleDept = (dept) => {
//     setExpandedDept(expandedDept === dept ? null : dept);
//   };

//   const badgeStyle = (status) => {
//     const map = {
//       APPROVED: { bg: '#dcfce7', color: '#166534' },
//       REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
//       PENDING: { bg: '#fef3c7', color: '#92400e' },
//       AVAILABLE: { bg: '#dbeafe', color: '#1e40af' },
//     };
//     const c = map[status] || { bg: '#e2e8f0', color: '#334155' };
//     return {
//       padding: '3px 8px',
//       borderRadius: '12px',
//       fontSize: '11px',
//       fontWeight: '600',
//       backgroundColor: c.bg,
//       color: c.color,
//       whiteSpace: 'nowrap'
//     };
//   };

//   return (
//     <div style={{
//       padding: '20px',
//       fontFamily: 'Arial, sans-serif',
//       height: '100%',
//       display: 'flex',
//       flexDirection: 'column',
//       boxSizing: 'border-box',
//       minHeight: 0,
//       overflow: 'hidden',
//     }}>
//       <h2 style={{ marginTop: 0 }}>Product Inventory & Request Report</h2>

//       {/* Top bar */}
//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px', flexShrink: 0 }}>
//         <button
//           style={{
//             padding: '8px 16px',
//             backgroundColor: '#3b82f6',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//           onClick={() => setShowDepartmentUsage(!showDepartmentUsage)}
//         >
//           {showDepartmentUsage ? 'Hide' : 'Show'} Department Usage
//         </button>

//         <button
//           onClick={exportToPDF}
//           style={{
//             padding: '8px 16px',
//             backgroundColor: '#dc2626',
//             color: '#fff',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer'
//           }}
//         >
//           Export to PDF
//         </button>

//         <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
//           <input
//             type="checkbox"
//             checked={autoRefresh}
//             onChange={(e) => setAutoRefresh(e.target.checked)}
//           />
//           Auto-refresh (15s)
//         </label>

//         {lastUpdated && (
//           <span style={{ fontSize: '12px', color: '#64748b' }}>
//             Last updated: {lastUpdated.toLocaleTimeString()}
//           </span>
//         )}
//       </div>

//       {/* Period Filter Bar */}
//       <div style={{
//         display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px',
//         padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px',
//         border: '1px solid #bfdbfe',
//         flexShrink: 0
//       }}>
//         <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>
//           Report Period:
//         </strong>

//         <select
//           value={yearFilter}
//           onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
//           style={selectStyle}
//         >
//           <option value="ALL">All Years</option>
//           {years.map(y => (
//             <option key={y} value={y}>{y}</option>
//           ))}
//         </select>

//         <select
//           value={quarterFilter}
//           onChange={(e) => { setQuarterFilter(e.target.value); setCurrentPage(1); }}
//           style={selectStyle}
//         >
//           <option value="ALL">All Quarters</option>
//           <option value="1">Q1 (Jan – Mar)</option>
//           <option value="2">Q2 (Apr – Jun)</option>
//           <option value="3">Q3 (Jul – Sep)</option>
//           <option value="4">Q4 (Oct – Dec)</option>
//         </select>

//         {/* ✅ NEW: Month selector */}
//         <select
//           value={monthFilter}
//           onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
//           style={selectStyle}
//         >
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
//           onClick={() => {
//             setYearFilter(String(new Date().getFullYear()));
//             setQuarterFilter('ALL');
//             setMonthFilter('ALL');
//             setCurrentPage(1);
//           }}
//           style={{
//             padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af',
//             border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
//           }}
//         >
//           This Year
//         </button>
//       </div>

//       {/* Department Usage Panel */}
//       {showDepartmentUsage && (
//         <div style={{
//           marginBottom: '20px',
//           padding: '16px',
//           backgroundColor: '#f0f4f8',
//           borderRadius: '8px',
//           border: '1px solid #cbd5e1',
//           maxHeight: '300px',
//           overflowY: 'auto',
//           flexShrink: 0
//         }}>
//           <h3 style={{ marginTop: 0 }}>Department-wise Usage (Approved / Rejected)</h3>

//           {Object.keys(departmentUsage).length === 0 ? (
//             <p style={{ color: '#64748b' }}>No approved or rejected requests for this period.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
//               {Object.keys(departmentUsage).map((dept) => {
//                 const items = departmentUsage[dept];
//                 const isOpen = expandedDept === dept;
//                 const approvedCount = items.filter(i => i.status === 'APPROVED').length;
//                 const rejectedCount = items.filter(i => i.status === 'REJECTED').length;
//                 return (
//                   <div
//                     key={dept}
//                     style={{
//                       backgroundColor: '#fff',
//                       borderRadius: '6px',
//                       border: '1px solid #e2e8f0',
//                       overflow: 'hidden'
//                     }}
//                   >
//                     <div
//                       onClick={() => toggleDept(dept)}
//                       style={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         padding: '12px 16px',
//                         cursor: 'pointer',
//                         backgroundColor: isOpen ? '#e0e7ff' : '#f8fafc'
//                       }}
//                     >
//                       <span style={{ fontWeight: '600', color: '#1e293b' }}>{dept}</span>
//                       <span style={{ fontSize: '13px', color: '#64748b' }}>
//                         {items.length} request{items.length !== 1 ? 's' : ''}
//                         <span style={{ marginLeft: '10px', color: '#166534', fontWeight: 600 }}>
//                           ✓ {approvedCount}
//                         </span>
//                         <span style={{ marginLeft: '8px', color: '#b91c1c', fontWeight: 600 }}>
//                           ✗ {rejectedCount}
//                         </span>
//                         <span style={{ marginLeft: '10px' }}>{isOpen ? '▲' : '▼'}</span>
//                       </span>
//                     </div>

//                     {isOpen && (
//                       <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                         <thead>
//                           <tr>
//                             <th style={deptThStyle}>Product Name</th>
//                             <th style={deptThStyle}>Quantity</th>
//                             <th style={deptThStyle}>Status</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {items.map((item, i) => (
//                             <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
//                               <td style={deptTdStyle}>{item.productName}</td>
//                               <td style={{ ...deptTdStyle, fontWeight: '600' }}>{item.qty}</td>
//                               <td style={deptTdStyle}>
//                                 <span style={badgeStyle(item.status)}>{item.status}</span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Stock Status Cards */}
//       <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexShrink: 0 }}>
//         <div style={{
//           flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px',
//           boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px'
//         }}>
//           <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
//           <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
//         </div>
//         <div style={{
//           flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px',
//           boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px'
//         }}>
//           <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
//           <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
//         </div>
//       </div>

//       {/* Filter bar */}
//       <div style={{
//         display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px',
//         padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px',
//         border: '1px solid #e2e8f0',
//         flexShrink: 0
//       }}>
//         <input
//           type="text"
//           placeholder="Search product / description / department / supplier / voucher..."
//           value={search}
//           onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
//           style={{
//             flex: '1 1 240px', padding: '8px 12px', border: '1px solid #cbd5e1',
//             borderRadius: '6px', fontSize: '13px', outline: 'none'
//           }}
//         />

//         <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Admin Status</option>
//           <option value="APPROVED">APPROVED</option>
//           <option value="REJECTED">REJECTED</option>
//           <option value="PENDING">PENDING</option>
//           <option value="AVAILABLE">AVAILABLE</option>
//         </select>

//         <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Stock Status</option>
//           <option value="In Stock">In Stock</option>
//           <option value="Out of Stock">Out of Stock</option>
//         </select>

//         <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
//           <option value="ALL">All Departments</option>
//           {departments.map(d => (
//             <option key={d} value={d}>{d}</option>
//           ))}
//         </select>

//         <button
//           onClick={() => {
//             setSearch('');
//             setStatusFilter('ALL');
//             setStockFilter('ALL');
//             setDeptFilter('ALL');
//             setCurrentPage(1);
//           }}
//           style={{
//             padding: '8px 14px', backgroundColor: '#e2e8f0', color: '#334155',
//             border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
//           }}
//         >
//           Clear
//         </button>
//       </div>

//       {/* Data Table */}
//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <div style={{
//           flex: 1,
//           minHeight: 0,
//           display: 'flex',
//           flexDirection: 'column',
//         }}>
//           <div style={{
//             flex: 1,
//             minHeight: 0,
//             overflow: 'auto',
//             border: '1px solid #e2e8f0',
//             borderRadius: '8px',
//             backgroundColor: '#fff',
//           }}>
//             <table style={{
//               width: '100%',
//               borderCollapse: 'collapse',
//               tableLayout: 'fixed',
//               fontSize: '12px'
//             }}>
//               <colgroup>
//                 <col style={{ width: '11%' }} />
//                 <col style={{ width: '12%' }} />
//                 <col style={{ width: '5%' }} />
//                 <col style={{ width: '10%' }} />
//                 <col style={{ width: '8%' }} />
//                 <col style={{ width: '8%' }} />
//                 <col style={{ width: '9%' }} />
//                 <col style={{ width: '6%' }} />
//                 <col style={{ width: '6%' }} />
//                 <col style={{ width: '10%' }} />
//                 <col style={{ width: '7%' }} />
//                 <col style={{ width: '11%' }} />
//                 <col style={{ width: '15%' }} />
//                 <col style={{ width: '10%' }} />
//                 <col style={{ width: '12%' }} />
//               </colgroup>
//               <thead>
//                 <tr>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>ProductName</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>PDescription</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>PQty</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Req Qty</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Dept</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Supplier</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Voucher No</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Price</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Balance</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Receiptdate</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Issuedate</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Staff Desc</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Admin Note</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Status</th>
//                   <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Stock Stock</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedProducts.length === 0 ? (
//                   <tr>
//                     <td colSpan="15" style={{ padding: '20px', textAlign: 'center' }}>
//                       No products match your filters.
//                     </td>
//                   </tr>
//                 ) : (
//                   paginatedProducts.map((p) => (
//                     <tr key={p.productId} style={{ borderBottom: '1px solid #e2e8f0' }}>
//                       <td style={cellStyle}>{p.productName || '-'}</td>
//                       <td style={cellStyle}>{p.productDescription ?? '-'}</td>
//                       <td style={{ ...cellStyle, fontWeight: '600', color: '#1e40af', textAlign: 'center' }}>
//                         {p.productQuantity ?? '0'}
//                       </td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>{p.requestQuantity ?? '-'}</td>
//                       <td style={cellStyle}>{p.departmentName}</td>
//                       <td style={cellStyle}>{p.supplierName ?? '-'}</td>
//                       <td style={cellStyle}>{p.receiptVoucherNo ?? '-'}</td>
//                       <td style={{ ...cellStyle, textAlign: 'right' }}>
//                         {p.price != null ? Number(p.price).toLocaleString() : '-'}
//                       </td>
//                       <td style={{
//                         ...cellStyle,
//                         fontWeight: '600',
//                         textAlign: 'right',
//                         color: Number(p.balance) > 0 ? '#166534' : '#b91c1c'
//                       }}>
//                         {p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-'}
//                       </td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>{p.receiptDate ?? '-'}</td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>{p.issueDate ?? '-'}</td>
//                       <td style={cellStyle}>{p.description ?? '-'}</td>
//                       <td style={cellStyle}>{p.adminNote ?? '-'}</td>
//                       <td style={{ ...cellStyle, textAlign: 'center' }}>
//                         <span style={badgeStyle(p.status)}>{p.status ?? 'AVAILABLE'}</span>
//                       </td>
//                       <td style={{
//                         ...cellStyle,
//                         fontWeight: 'bold',
//                         textAlign: 'center',
//                         color: p.stockStatus === 'In Stock' ? '#166534' : '#b91c1c'
//                       }}>
//                         {p.stockStatus}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div style={{
//             display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
//             alignItems: 'center', gap: '10px', marginTop: '15px',
//             fontSize: '13px', color: '#475569',
//             flexShrink: 0
//           }}>
//             <div>
//               Showing{' '}
//               <strong>{filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong>{' '}
//               – <strong>{Math.min(currentPage * pageSize, filteredProducts.length)}</strong>{' '}
//               of <strong>{filteredProducts.length}</strong> results
//             </div>

//             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//               <label>
//                 Rows:
//                 <select
//                   value={pageSize}
//                   onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
//                   style={{ marginLeft: '6px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
//                 >
//                   <option value={5}>5</option>
//                   <option value={10}>10</option>
//                   <option value={25}>25</option>
//                   <option value={50}>50</option>
//                 </select>
//               </label>

//               <button
//                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 style={pageBtnStyle(currentPage === 1)}
//               >
//                 Prev
//               </button>

//               <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>

//               <button
//                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 style={pageBtnStyle(currentPage === totalPages)}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const headerStyle = {
//   padding: '10px 6px',
//   backgroundColor: '#1e40af',
//   color: '#fff',
//   textAlign: 'left',
//   fontSize: '11px',
//   fontWeight: '700',
//   whiteSpace: 'normal',
//   wordBreak: 'break-word',
//   verticalAlign: 'middle',
//   borderRight: '1px solid #3b5fbf'
// };

// const cellStyle = {
//   padding: '10px 6px',
//   fontSize: '12px',
//   whiteSpace: 'normal',
//   wordBreak: 'break-word',
//   overflowWrap: 'anywhere',
//   verticalAlign: 'top',
//   color: '#1e293b'
// };

// const selectStyle = {
//   padding: '8px 10px',
//   border: '1px solid #cbd5e1',
//   borderRadius: '6px',
//   fontSize: '13px',
//   backgroundColor: '#fff',
//   cursor: 'pointer'
// };

// const deptThStyle = {
//   padding: '8px 16px',
//   textAlign: 'left',
//   fontSize: '12px',
//   color: '#475569',
//   textTransform: 'uppercase',
//   letterSpacing: '0.5px',
//   backgroundColor: '#f8fafc',
//   borderBottom: '1px solid #e2e8f0'
// };

// const deptTdStyle = {
//   padding: '10px 16px',
//   fontSize: '13px',
//   color: '#1e293b'
// };

// const pageBtnStyle = (disabled) => ({
//   padding: '6px 12px',
//   backgroundColor: disabled ? '#e2e8f0' : '#3b82f6',
//   color: disabled ? '#94a3b8' : '#fff',
//   border: 'none',
//   borderRadius: '4px',
//   cursor: disabled ? 'not-allowed' : 'pointer',
//   fontSize: '13px'
// });

// export default ProductReport;
import React, { useState, useEffect, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProductReport = () => {
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDepartmentUsage, setShowDepartmentUsage] = useState(false);
  const [departmentUsage, setDepartmentUsage] = useState({});
  const [expandedDept, setExpandedDept] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [quarterFilter, setQuarterFilter] = useState('ALL');
  const [monthFilter, setMonthFilter] = useState('ALL');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const REFRESH_INTERVAL = 15000;

  useEffect(() => {
    fetchData();
  }, []);

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
        fetch('http://localhost:8080/api/products/all'),
        fetch('http://localhost:8080/api/product-requests/all')
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

        const stockStatus =
          requestStatus === 'APPROVED'
            ? 'Out of Stock'
            : (Number(prod.productQuantity) > 0 ? 'In Stock' : 'Out of Stock');

        return {
          ...prod,
          productQuantity: prod.productQuantity ?? '0',
          requestQuantity: req?.quantity ?? '-',
          adminNote: req?.adminNote ?? '-',
          description: req?.description ?? '-',
          status: requestStatus,
          departmentName: req?.departmentName ?? (prod.department?.departmentName ?? '-'),
          productDescription: prod.productDescription ?? '-',
          stockStatus,
          requestedProductName: req?.product?.productName ?? '-',
          receiptVoucherNo: prod.receiptVoucherNo ?? '-',
          supplierName: prod.supplierName ?? '-',
          balance: prod.balance ?? '-',
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
    const set = new Set();

    products.forEach(p => {
      const y = getYear(getFilterDate(p));
      if (y) set.add(y);
    });

    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 3; i++) {
      set.add(currentYear - i);
    }

    return Array.from(set).sort((a, b) => b - a);
  }, [products]);

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

  const inStockCount = periodProducts.filter(p => p.stockStatus === 'In Stock').length;
  const outStockCount = periodProducts.filter(p => p.stockStatus === 'Out of Stock').length;

  const departments = useMemo(() => {
    const set = new Set(periodProducts.map(p => p.departmentName).filter(Boolean));
    return Array.from(set).sort();
  }, [periodProducts]);

  const filteredProducts = useMemo(() => {
    return periodProducts.filter(p => {
      const searchMatch =
        !search ||
        (p.productName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.productDescription || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.departmentName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.supplierName || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.receiptVoucherNo || '').toLowerCase().includes(search.toLowerCase());

      const statusMatch = statusFilter === 'ALL' || p.status === statusFilter;
      const stockMatch = stockFilter === 'ALL' || p.stockStatus === stockFilter;
      const deptMatch = deptFilter === 'ALL' || p.departmentName === deptFilter;

      return searchMatch && statusMatch && stockMatch && deptMatch;
    });
  }, [periodProducts, search, statusFilter, stockFilter, deptFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // ============ PDF EXPORT ============
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

    const filterSummary = [];
    if (search) filterSummary.push(`Search: "${search}"`);
    if (statusFilter !== 'ALL') filterSummary.push(`Admin Status: ${statusFilter}`);
    if (stockFilter !== 'ALL') filterSummary.push(`Stock: ${stockFilter}`);
    if (deptFilter !== 'ALL') filterSummary.push(`Department: ${deptFilter}`);

    let y = 84;
    if (filterSummary.length > 0) {
      doc.setTextColor(100);
      doc.text(`Filters: ${filterSummary.join('  |  ')}`, marginLeft, y);
      y += 12;
    }

    // ---- Summary Cards ----
    const cardY = y + 4;
    const cardHeight = 34;
    const cardGap = 10;
    const cardWidth = (tableWidth - cardGap * 2) / 3;

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(marginLeft, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(22, 101, 52);
    doc.setFontSize(9);
    doc.text('In Stock', marginLeft + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(inStockCount), marginLeft + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    doc.setFillColor(254, 226, 226);
    doc.roundedRect(marginLeft + cardWidth + cardGap, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(9);
    doc.text('Out of Stock', marginLeft + cardWidth + cardGap + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(outStockCount), marginLeft + cardWidth + cardGap + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    doc.setFillColor(219, 234, 254);
    doc.roundedRect(marginLeft + (cardWidth + cardGap) * 2, cardY, cardWidth, cardHeight, 4, 4, 'F');
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(9);
    doc.text('Total Rows', marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 14);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(filteredProducts.length), marginLeft + (cardWidth + cardGap) * 2 + 10, cardY + 28);
    doc.setFont('helvetica', 'normal');

    y = cardY + cardHeight + 20;

    // ---- Department Usage Table (only when data exists) ----
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
              valign: 'middle',
              halign: 'left',
              fontStyle: 'bold',
              textColor: [15, 23, 42],
              fillColor: [241, 245, 249]
            }
          },
          {
            content: `Total Requests: ${items.length}`,
            styles: {
              fontStyle: 'bold',
              halign: 'center',
              textColor: [30, 64, 175],
              fillColor: [219, 234, 254]
            }
          },
          {
            content: `Approved: ${approvedCount}`,
            styles: {
              fontStyle: 'bold',
              halign: 'center',
              textColor: [22, 101, 52],
              fillColor: [220, 252, 231]
            }
          },
          {
            content: `Rejected: ${rejectedCount}`,
            styles: {
              fontStyle: 'bold',
              halign: 'center',
              textColor: [185, 28, 28],
              fillColor: [254, 226, 226]
            }
          }
        ]);

        items.forEach(item => {
          body.push([
            { content: item.productName, styles: { halign: 'left' } },
            { content: String(item.qty), styles: { halign: 'center', fontStyle: 'bold' } },
            {
              content: item.status,
              styles: {
                halign: 'center',
                fontStyle: 'bold',
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
        body: body,
        theme: 'grid',
        styles: {
          fontSize: 9,
          cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
          overflow: 'linebreak',
          valign: 'middle',
          lineColor: [203, 213, 225],
          lineWidth: 0.5,
          textColor: [30, 41, 59]
        },
        headStyles: {
          fillColor: [30, 64, 175],
          textColor: 255,
          fontStyle: 'bold',
          valign: 'middle',
          fontSize: 9
        },
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

    // ---- Product Details Table (with all attributes) ----
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
        'ID',
        'Name',
        'Description',
        'Quantity',
        'QtyReq',
        'Unit Price',
        'Supplier',
        'Supplier VoucherNo',
        'Balance',
        'Receipt Date',
        'Issue Date',
        'Staff Desc',
        'Admin Note',
        'Status',
        'Stock Status'
      ]],
      body: filteredProducts.map(p => [
        { content: p.productId ?? '-', styles: { halign: 'center', fontStyle: 'bold' } },
        p.productName ?? '-',
        p.productDescription ?? '-',
        { content: p.productQuantity ?? '0', styles: { halign: 'center', fontStyle: 'bold' } },
        { content: p.requestQuantity ?? '-', styles: { halign: 'center' } },
        { content: p.price != null ? Number(p.price).toLocaleString() : '-', styles: { halign: 'right' } },
        p.supplierName ?? '-',
        p.receiptVoucherNo ?? '-',
        { content: p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-', styles: { halign: 'right' } },
        { content: p.receiptDate ?? '-', styles: { halign: 'center' } },
        { content: p.issueDate ?? '-', styles: { halign: 'center' } },
        p.description ?? '-',
        p.adminNote ?? '-',
        p.status ?? '-',
        p.stockStatus ?? '-'
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
        0:  { cellWidth: 30,  halign: 'center' },
        1:  { cellWidth: 60,  halign: 'left', fontStyle: 'bold' },
        2:  { cellWidth: 75,  halign: 'left' },
        3:  { cellWidth: 40,  halign: 'center' },
        4:  { cellWidth: 45,  halign: 'center' },
        5:  { cellWidth: 40,  halign: 'right' },
        6:  { cellWidth: 55,  halign: 'left' },
        7:  { cellWidth: 70,  halign: 'left' },
        8:  { cellWidth: 45,  halign: 'right' },
        9:  { cellWidth: 55,  halign: 'center' },
        10: { cellWidth: 55,  halign: 'center' },
        11: { cellWidth: 70,  halign: 'left' },
        12: { cellWidth: 70,  halign: 'left' },
        13: { cellWidth: 55,  halign: 'center' },
        14: { cellWidth: 50,  halign: 'center' }
      },
      margin: { left: marginLeft, right: marginRight },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Status column (index 13)
          if (data.column.index === 13) {
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
            } else if (v === 'AVAILABLE') {
              data.cell.styles.textColor = [30, 64, 175];
              data.cell.styles.fillColor = [219, 234, 254];
              data.cell.styles.fontStyle = 'bold';
            }
          }
          // Stock Status column (index 14)
          if (data.column.index === 14) {
            const v = data.cell.raw;
            if (v === 'In Stock') {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = 'bold';
            } else if (v === 'Out of Stock') {
              data.cell.styles.textColor = [185, 28, 28];
              data.cell.styles.fontStyle = 'bold';
            }
          }
          // Balance column (index 8) — green if positive, red otherwise
          if (data.column.index === 8) {
            const v = data.cell.raw;
            if (v !== '-' && Number(String(v).replace(/,/g, '')) > 0) {
              data.cell.styles.textColor = [22, 101, 52];
              data.cell.styles.fontStyle = 'bold';
            } else if (v !== '-') {
              data.cell.styles.textColor = [185, 28, 28];
            }
          }
        }
      }
    });

    // ---- Footer on every page ----
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
      (yearFilter === 'ALL' ? 'AllYears' : yearFilter) +
      '_' +
      (quarterFilter === 'ALL' ? 'AllQ' : 'Q' + quarterFilter) +
      '_' +
      (monthFilter === 'ALL' ? 'AllM' : 'M' + monthFilter);
    doc.save(`Product_Report_${periodTag}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const toggleDept = (dept) => {
    setExpandedDept(expandedDept === dept ? null : dept);
  };

  const badgeStyle = (status) => {
    const map = {
      APPROVED: { bg: '#dcfce7', color: '#166534' },
      REJECTED: { bg: '#fee2e2', color: '#b91c1c' },
      PENDING: { bg: '#fef3c7', color: '#92400e' },
      AVAILABLE: { bg: '#dbeafe', color: '#1e40af' },
    };
    const c = map[status] || { bg: '#e2e8f0', color: '#334155' };
    return {
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      backgroundColor: c.bg,
      color: c.color,
      whiteSpace: 'nowrap'
    };
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      minHeight: 0,
      overflow: 'hidden',
    }}>
      <h2 style={{ marginTop: 0 }}>Product Inventory & Request Report</h2>

      {/* Top bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '15px', flexShrink: 0 }}>
        <button
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={() => setShowDepartmentUsage(!showDepartmentUsage)}
        >
          {showDepartmentUsage ? 'Hide' : 'Show'} Department Usage
        </button>

        <button
          onClick={exportToPDF}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export to PDF
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (15s)
        </label>

        {lastUpdated && (
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Period Filter Bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px',
        padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px',
        border: '1px solid #bfdbfe',
        flexShrink: 0
      }}>
        <strong style={{ fontSize: '13px', color: '#1e40af', alignSelf: 'center' }}>
          Report Period:
        </strong>

        <select
          value={yearFilter}
          onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
          style={selectStyle}
        >
          <option value="ALL">All Years</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={quarterFilter}
          onChange={(e) => { setQuarterFilter(e.target.value); setCurrentPage(1); }}
          style={selectStyle}
        >
          <option value="ALL">All Quarters</option>
          <option value="1">Q1 (Jan – Mar)</option>
          <option value="2">Q2 (Apr – Jun)</option>
          <option value="3">Q3 (Jul – Sep)</option>
          <option value="4">Q4 (Oct – Dec)</option>
        </select>

        <select
          value={monthFilter}
          onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
          style={selectStyle}
        >
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
          onClick={() => {
            setYearFilter(String(new Date().getFullYear()));
            setQuarterFilter('ALL');
            setMonthFilter('ALL');
            setCurrentPage(1);
          }}
          style={{
            padding: '8px 14px', backgroundColor: '#dbeafe', color: '#1e40af',
            border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
          }}
        >
          This Year
        </button>
      </div>

      {/* Department Usage Panel */}
      {showDepartmentUsage && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f0f4f8',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          maxHeight: '300px',
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <h3 style={{ marginTop: 0 }}>Department-wise Usage (Approved / Rejected)</h3>

          {Object.keys(departmentUsage).length === 0 ? (
            <p style={{ color: '#64748b' }}>No approved or rejected requests for this period.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.keys(departmentUsage).map((dept) => {
                const items = departmentUsage[dept];
                const isOpen = expandedDept === dept;
                const approvedCount = items.filter(i => i.status === 'APPROVED').length;
                const rejectedCount = items.filter(i => i.status === 'REJECTED').length;
                return (
                  <div
                    key={dept}
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      onClick={() => toggleDept(dept)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        backgroundColor: isOpen ? '#e0e7ff' : '#f8fafc'
                      }}
                    >
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{dept}</span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {items.length} request{items.length !== 1 ? 's' : ''}
                        <span style={{ marginLeft: '10px', color: '#166534', fontWeight: 600 }}>
                           {approvedCount}
                        </span>
                        <span style={{ marginLeft: '8px', color: '#b91c1c', fontWeight: 600 }}>
                           {rejectedCount}
                        </span>
                        <span style={{ marginLeft: '10px' }}>{isOpen ? '▲' : '▼'}</span>
                      </span>
                    </div>

                    {isOpen && (
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={deptThStyle}>Product Name</th>
                            <th style={deptThStyle}>Quantity</th>
                            <th style={deptThStyle}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((item, i) => (
                            <tr key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                              <td style={deptTdStyle}>{item.productName}</td>
                              <td style={{ ...deptTdStyle, fontWeight: '600' }}>{item.qty}</td>
                              <td style={deptTdStyle}>
                                <span style={badgeStyle(item.status)}>{item.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Stock Status Cards */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexShrink: 0 }}>
        <div style={{
          flex: 1, padding: '20px', backgroundColor: '#dcfce7', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px'
        }}>
          <h3 style={{ margin: 0, color: '#166534' }}>In Stock</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', color: '#166534' }}>{inStockCount}</p>
        </div>
        <div style={{
          flex: 1, padding: '20px', backgroundColor: '#fee2e2', borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', maxWidth: '140px'
        }}>
          <h3 style={{ margin: 0, color: '#b91c1c' }}>Out of Stock</h3>
          <p style={{ fontSize: '24px', margin: '10px 0', color: '#b91c1c' }}>{outStockCount}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px',
        padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px',
        border: '1px solid #e2e8f0',
        flexShrink: 0
      }}>
        <input
          type="text"
          placeholder="Search product / description / department / supplier / voucher..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          style={{
            flex: '1 1 240px', padding: '8px 12px', border: '1px solid #cbd5e1',
            borderRadius: '6px', fontSize: '13px', outline: 'none'
          }}
        />

        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
          <option value="ALL">All Admin Status</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
          <option value="PENDING">PENDING</option>
          <option value="AVAILABLE">AVAILABLE</option>
        </select>

        <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
          <option value="ALL">All Stock Status</option>
          <option value="In Stock">In Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>

        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }} style={selectStyle}>
          <option value="ALL">All Departments</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch('');
            setStatusFilter('ALL');
            setStockFilter('ALL');
            setDeptFilter('ALL');
            setCurrentPage(1);
          }}
          style={{
            padding: '8px 14px', backgroundColor: '#e2e8f0', color: '#334155',
            border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
          }}
        >
          Clear
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            backgroundColor: '#fff',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              fontSize: '12px'
            }}>
              <colgroup>
                <col style={{ width: '11%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '5%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '7%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>ProductName</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>PDescription</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>PQty</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>QtyReq</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Dept</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Supplier</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Voucher No</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Price</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Balance</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Receiptdate</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Issuedate</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Staff Desc</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Admin Note</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Status</th>
                  <th style={{ ...headerStyle, position: 'sticky', top: 0, zIndex: 2 }}>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan="15" style={{ padding: '20px', textAlign: 'center' }}>
                      No products match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((p) => (
                    <tr key={p.productId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={cellStyle}>{p.productName || '-'}</td>
                      <td style={cellStyle}>{p.productDescription ?? '-'}</td>
                      <td style={{ ...cellStyle, fontWeight: '600', color: '#1e40af', textAlign: 'center' }}>
                        {p.productQuantity ?? '0'}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>{p.requestQuantity ?? '-'}</td>
                      <td style={cellStyle}>{p.departmentName}</td>
                      <td style={cellStyle}>{p.supplierName ?? '-'}</td>
                      <td style={cellStyle}>{p.receiptVoucherNo ?? '-'}</td>
                      <td style={{ ...cellStyle, textAlign: 'right' }}>
                        {p.price != null ? Number(p.price).toLocaleString() : '-'}
                      </td>
                      <td style={{
                        ...cellStyle,
                        fontWeight: '600',
                        textAlign: 'right',
                        color: Number(p.balance) > 0 ? '#166534' : '#b91c1c'
                      }}>
                        {p.balance != null && p.balance !== '-' ? Number(p.balance).toLocaleString() : '-'}
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>{p.receiptDate ?? '-'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>{p.issueDate ?? '-'}</td>
                      <td style={cellStyle}>{p.description ?? '-'}</td>
                      <td style={cellStyle}>{p.adminNote ?? '-'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <span style={badgeStyle(p.status)}>{p.status ?? 'AVAILABLE'}</span>
                      </td>
                      <td style={{
                        ...cellStyle,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: p.stockStatus === 'In Stock' ? '#166534' : '#b91c1c'
                      }}>
                        {p.stockStatus}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
            alignItems: 'center', gap: '10px', marginTop: '15px',
            fontSize: '13px', color: '#475569',
            flexShrink: 0
          }}>
            <div>
              Showing{' '}
              <strong>{filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong>{' '}
              – <strong>{Math.min(currentPage * pageSize, filteredProducts.length)}</strong>{' '}
              of <strong>{filteredProducts.length}</strong> results
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label>
                Rows:
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                  style={{ marginLeft: '6px', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </label>

              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={pageBtnStyle(currentPage === 1)}
              >
                Prev
              </button>

              <span>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={pageBtnStyle(currentPage === totalPages)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const headerStyle = {
  padding: '10px 6px',
  backgroundColor: '#1e40af',
  color: '#fff',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: '700',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  verticalAlign: 'middle',
  borderRight: '1px solid #3b5fbf'
};

const cellStyle = {
  padding: '10px 6px',
  fontSize: '12px',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
  verticalAlign: 'top',
  color: '#1e293b'
};

const selectStyle = {
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: '6px',
  fontSize: '13px',
  backgroundColor: '#fff',
  cursor: 'pointer'
};

const deptThStyle = {
  padding: '8px 16px',
  textAlign: 'left',
  fontSize: '12px',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #e2e8f0'
};

const deptTdStyle = {
  padding: '10px 16px',
  fontSize: '13px',
  color: '#1e293b'
};

const pageBtnStyle = (disabled) => ({
  padding: '6px 12px',
  backgroundColor: disabled ? '#e2e8f0' : '#3b82f6',
  color: disabled ? '#94a3b8' : '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontSize: '13px'
});

export default ProductReport;