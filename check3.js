// --- CONFIGURATION ---
const imageUrl = 'background_1.png';
const imageWidth = 1800;
const imageHeight =  1299;
let isAnimating = false;

// 4. Tọa độ BOUNDS mới ôm trọn Vĩnh Long, Bến Tre, Trà Vinh
var imageBounds = [
    [9.509, 105.6556], // Góc dưới bên trái (South-West)
    [10.3810, 106.8805]  // Góc trên bên phải (North-East)
];



// tô vùng dự án nếu là khu công nghiệp // polygon
var BOUNDARY_COORDS = [
  [10.03,105.80],[10.08,105.82],[10.12,105.88],[10.15,105.95],
  [10.18,106.05],[10.22,106.12],[10.28,106.20],[10.34,106.25],
  [10.42,106.28],[10.48,106.22],[10.52,106.15],[10.55,106.05],
  [10.52,105.95],[10.48,105.85],[10.42,105.78],[10.35,105.72],
  [10.28,105.70],[10.20,105.72],[10.12,105.75],[10.03,105.80]
];

const geoJsonXaPhuongUrl = "https://raw.githubusercontent.com/CVNSS/VLmap/main/124map.geojson";

// 5. Đường dẫn tới các file GeoJSON của bạn
//quoclo.geojson //đường quốc lộ
//tinhlo.geojson // tỉnh lộ hiện tại thiếu
//HT_GTVT_3405.geojson // vừa quốc lộ vừa tỉnh bộ
// DiaGioiXa_2025_SauSapNhap_DUY_03_07_2 : chia địa giới xã đầy đủ
// QH_GTVT_3405: các dự án , đầy đủ chưa tách
const quocLoUrl = "./quoclo-tinhlo-geojson/quoclo.geojson";
const tinhLoUrl = "./quoclo-tinhlo-geojson/HT_GTVT_3405.geojson"; //tinhlo.geojson hoặc HT_GTVT_3405.geojson
//DỰ ÁN
// const duAnCT33Url = "./duan-geojson/QH_GTVT_3405_FeaturesToJSON1.geojson";
// const duAnCT33Url = "./duan-geojson/duan-fid106-CT33.geojson";
const duAnCT33Url = "./duan-geojson/duan-fid106-CT33.geojson";
const duAnCT34Url = "./duan-geojson/duan-fid83-CT34.geojson";
const duAnCTVenBienUrl = "./duan-geojson/duan-fid76-duongvenbien.geojson";

// Hàm định nghĩa Style cho Polygon (Bạn thay đổi màu sắc tùy ý)
function defaultStyle(feature) {
    return {
        fillColor: 'transparent', // Màu nền trong suốt
        weight: 2,
        opacity: 1,
        color: 'gray',
        dashArray: '10, 10' ,
        fillOpacity: 1
    };
}
// 2. Định nghĩa màu sắc (Style) riêng cho từng loại layer
function quocLoStyle(feature) {
    return { color: "#d32f2f", weight: 4, opacity: 0.8 }; // Màu đỏ cho Quốc lộ
}

function tinhLoStyle(feature) {
    return { color: "#1976d2", weight: 2.5, opacity: 0.8 };  // Màu xanh dương cho Tỉnh lộ
}

// Thay đổi hoặc bổ sung hàm Style cho Dự án để chắc chắn hiển thị được cả Polygon lẫn Line
function duAnStyle(feature) {
    // Nếu dự án của bạn xuất ra dạng vùng (Polygon / MultiPolygon)
    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        return {
            className: 'shadow-path',
            fillColor: "darkgreen",
            fillOpacity: 0.3,
            color: "#d35400",
            weight: 2
        };
    }
    // Nếu dự án của bạn xuất ra dạng đường (LineString / MultiLineString)
    return {
        className: 'shadow-path',
        color: "darkgreen",
        weight: 6,
        opacity: 0.9
    };
}

// 1. Khởi tạo bản đồ, đặt tâm tại Vĩnh Long và zoom mặc định là 11
var map = L.map('map').setView([9.960, 106.250], 1);

map.createPane('paneTinhLo');
map.getPane('paneTinhLo').style.zIndex = 401;

map.createPane('paneQuocLo');
map.getPane('paneQuocLo').style.zIndex = 402; // QL luôn nằm trên ĐT

map.createPane('paneDuAn');
map.getPane('paneDuAn').style.zIndex = 403; // QL luôn nằm trên ĐT
// 2. Thêm lớp nền OpenStreetMap chuẩn
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);


/* 
    Tọa độ góc giới hạn của bức ảnh [Góc Tây Nam, Góc Đông Bắc].
    BẠN CẦN ĐIỀU CHỈNH TỌA ĐỘ NÀY CHO KHỚP VỚI ẢNH CỦA BẠN.
    Dưới đây là tọa độ giả định ôm trọn khu vực tỉnh Vĩnh Long.
*/
// 4. Tiến hành chồng ảnh lên bản đồ và chỉnh độ mờ (opacity)
var vinhLongOverlay = L.imageOverlay(imageUrl, imageBounds, {
    opacity: 1,       // Độ đậm nhạt của ảnh (từ 0 đến 1) để vẫn nhìn thấy nền OSM bên dưới
    alt: 'Bản đồ tỉnh Vĩnh Long',
    //interactive: true   // Bật nếu bạn muốn click vào ảnh
}).addTo(map);


// --- STYLING FOR POLYGONS ---
const hoverStyle = {
    weight: 1,           // Outline thickness
    color: '#ffff',    // Outline (stroke) color
    opacity: 1,          // Outline opacity
    fillColor: '#000000',// Fill color
    fillOpacity: 0.3     // Fill opacity
};
const highlightStyle = {
    color: "#ffff00",     // Using same color as hover for consistency
    weight: 1,
    opacity: 1,
    fillColor: '#000000',// Fill color
    fillOpacity: 0.3     // Fill opacity
};

function createPopupContent(data) {
    // Keep the original header
    let html = `<div class='bando-header'><img src='/DesktopModules/BanDo/lib/img/header-icon.png'> ${data.ten_xa}</div>`;

    // Add a container for padding and start the table
    html += `<div class='bando-table-container'><table class='bando-table'>`;

    // Loop through the data to create table rows
    data.detailDatas.forEach(detail => {
        // --- MODIFICATION START ---
        if (detail.is_link) {
            // If it's a link, create a single, full-width row as requested.
            // The entire content is wrapped in an anchor tag <a> to make it clickable.
            html += `
        <tr>
            <td class="bando-cell-label bando-link" colspan="2">
                <a class='bando-lienkiet' target="_blank" href='${detail.content}'>
                    <img src='${detail.icon}'> ${detail.dataType}
                </a>
            </td>
        </tr>`;
        } else {
            // Otherwise, create the standard two-column row for regular data.
            html += `
        <tr>
            <td class="bando-cell-label"><img src='${detail.icon}'> ${detail.dataType}:</td>
            <td class="bando-cell-value">
                <span class='bando-content'>${detail.content} ${detail.unit}</span>
            </td>
        </tr>`;
        }
        // --- MODIFICATION END ---
    });

    html += `</table></div>`; // Close the table and container

    return html;
}

let polygonLayers = {};
let selectedLayer = null;

// --- UPDATED: DATA CONVERSION & MERGE ---
// Create a lookup map for faster access to polygon coordinates.

let geoJsonXaPhuongLayer; // Khai báo biến layer bên ngoài để hàm resetStyle gọi được
let geoJsonXaPhuongGroup; 

fetch(geoJsonXaPhuongUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error("Không thể tải file GeoJSON từ URL.");
        }
        return response.json();
    })
    .then(data => {

        // Khởi tạo layer GeoJSON của Leaflet
        geoJsonXaPhuongLayer = L.geoJSON(data, {
            style: defaultStyle,     // Thiết lập style mặc định cho polygon
            onEachFeature: onEachFeature // Gọi hàm xử lý tương tác của bạn
        }).addTo(map);

        // Tự động căn bản đồ (zoom/pan) vừa khít với các Polygon vừa load
        map.fitBounds(geoJsonXaPhuongLayer.getBounds());
    })
    .catch(error => {
        console.error("Lỗi khi load bản đồ:", error);
    });


// 2. Hàm xử lý từng feature (Hàm onEachFeature của bạn đã sửa lỗi kẹt mouseover)
//XÃ PHƯỜNG
function onEachFeature(feature, layer) {
    // Lưu layer vào object theo huyenId
    if (feature.properties && feature.properties.huyenId) {
        polygonLayers[feature.properties.huyenId] = layer;
    }

    // Gán Tooltip (Lưu ý sửa interactive: false để tránh lỗi liệt mouseover)
    // layer.bindTooltip(feature.properties.ten_xa || "Không tên", {
    //     sticky: true,
    //     interactive: false, 
    //     className: 'hover-popup',
    //     direction: 'top'
    // });

    // Gán Popup khi click
    // layer.bindPopup(`${feature.properties.ten_xa || 'Chưa cập nhật'}`, {
    //     minWidth: 320
    // });

    // Sự kiện tương tác chuột
    layer.on({
        mouseover: function (e) {
            // if (isAnimating) return; 
            // if (e.target !== selectedLayer) {
            //     const styleOnHover = e.target.feature.properties.highlight === true ? highlightStyle : hoverStyle;
            //     e.target.setStyle(styleOnHover);
            // }
        },
        mouseout: function (e) {
            // // Trả về style mặc định khi di chuột ra ngoài
            // if (e.target !== selectedLayer) {
            //     geoJsonXaPhuongLayer.resetStyle(e.target);
            // }
        }
    });
}

// // **CHANGED**: Use a function for styling to handle initial state
// // apply HIGHLIGHT STYLE CHO XA PHUONG
//   const geoJsonXaPhuongLayer = L.geoJson(geoJsonData, {
//       style: function (feature) {
//           // If the feature is marked for highlight, apply the style immediately
//           if (feature.properties.highlight === true) {
//               return highlightStyle;
//           }
//           // Otherwise, use the default (invisible) style
//           return defaultStyle;
//       },
//       onEachFeature: onEachFeature
//   }).addTo(map);
  
  
  map.on('click', function () {
            // if (selectedLayer) {
            //     // **CHANGED**: Reset the selected layer to its correct base style before deselecting
            //     if (selectedLayer.feature.properties.highlight === true) {
            //         selectedLayer.setStyle(highlightStyle);
            //     } else {
            //         selectedLayer.setStyle(defaultStyle);
            //     }
            //     selectedLayer = null;
            //     map.closePopup();
            //     $('#area-selector').val("").trigger('change.select2');
            // }
        });


var layers = {};

//TẠO VÀ XỬ LÝ PROJECTS
var PROJECTS = {
  da1: {
    title: 'CAO TỐC CT33',
    sub: 'CAO TỐC CT33',
    badge: 'DA-VL-001',
    color: '#185FA5', colorBg: '#dbeafe', colorTxt: '#1e3a5f',
    len: '18.4 km', von: '312 tỷ', tiendo: 67, tt: 'Đang thi công',
    ttColor: '#1D9E75',
    tg: '2023 – 2025 (36 tháng)',
    vonText: 'Ngân sách Trung ương 70% + Ngân sách địa phương 30%',
    quymo: 'B = 12m · Mặt đường 7m · Lề 2×2.5m · Tải trọng H30-XB80',
    ghichu: 'Đoạn qua TP. Vĩnh Long đang chờ GPMB 1.2 km cuối. Dự kiến hoàn thành Q2/2025. Cần lưu ý xử lý lún đoạn Km8+000 – Km9+500.',
    cotmoc: ['Km0+000','Km2+500','Km5+000','Km7+500','Km10+000','Km12+500','Km15+000','Km17+600','Km18+400'],
    coords: [
      [10.2530,105.9730],[10.2450,105.9900],[10.2350,106.0100],
      [10.2200,106.0300],[10.2050,106.0520],[10.1900,106.0750],
      [10.1780,106.0980],[10.1650,106.1200],[10.1530,106.1430]
    ]
  },
  da2: {
    title: 'CAO TỐC CT34',
    sub: 'CAO TỐC CT34',
    badge: 'DA-VL-002',
    color: '#1D9E75', colorBg: '#d1fae5', colorTxt: '#064e3b',
    len: '12.8 km', von: '198 tỷ', tiendo: 32, tt: 'Đang thi công',
    ttColor: '#BA7517',
    tg: '2024 – 2026 (24 tháng)',
    vonText: 'Vốn ODA Nhật Bản (JICA) 85% + Vốn đối ứng trong nước 15%',
    quymo: 'B = 9m · Mặt đường 6m · Lề 2×1.5m · Tải trọng H30',
    ghichu: 'Đi qua vùng đất yếu, cần gia cố nền cọc cát đoạn Km3+200 – Km4+800. Thiết kế cầu mới tại Km6+200 thay thế phà cũ, nhịp 45m.',
    cotmoc: ['Km0+000','Km2+000','Km4+000','Km6+000','Km6+200 (Cầu)','Km8+000','Km10+000','Km12+800'],
    coords: [
      [10.2600,105.9050],[10.2520,105.9250],[10.2460,105.9450],
      [10.2420,105.9650],[10.2400,105.9900],[10.2380,106.0150],
      [10.2360,106.0380],[10.2330,106.0600]
    ]
  },
  da3: {
    title: 'ĐƯỜNG VEN BIỂN',
    sub: 'ĐƯỜNG VEN BIỂN',
    badge: 'DA-VL-003',
    color: '#BA7517', colorBg: '#fef3c7', colorTxt: '#78350f',
    len: '8.6 km', von: '425 tỷ', tiendo: 12, tt: 'Khởi công',
    ttColor: '#D85A30',
    tg: '2024 – 2027 (42 tháng)',
    vonText: 'Ngân sách tỉnh 40% + Huy động xã hội hóa 60%',
    quymo: 'B = 40m (quy hoạch) · Giai đoạn 1: B = 22m · 4 làn xe · Có dải phân cách',
    ghichu: 'Tuyến kết nối cầu Mỹ Thuận 2 với QL1. Đang hoàn thiện hồ sơ thiết kế kỹ thuật. GPMB đạt 78% (còn 22 hộ chưa bàn giao).',
    cotmoc: ['Km0+000','Km1+500','Km3+000','Km4+500','Km6+000','Km7+200','Km8+600'],
    coords: [
      [10.2750,105.9350],[10.2800,105.9550],[10.2830,105.9750],
      [10.2820,105.9980],[10.2780,106.0200],[10.2720,106.0420],[10.2660,106.0600]
    ]
  }
};
console.log('project 1', PROJECTS);

// Tải song song cả 3 file GeoJSON bằng Promise.all
Promise.all([
    fetch(duAnCT33Url).then(res => res.json()),
   fetch(duAnCT34Url).then(res => res.json()),
   fetch(duAnCTVenBienUrl).then(res => res.json()),
])
.then(([duAnCT33Data, duAnCT34Data, duAnVenBienData]) => {
    function swapLatLng([a, b]) {
        return [b, a];
    }
    console.log("Đã tải xong toàn bộ dữ liệu nền và dữ liệu dự án!");
    var combineArray1 = [];
    // Nạp dữ liệu Dự án Quy hoạch GTVT
    if (duAnCT33Data && (duAnCT33Data.features || duAnCT33Data.type === "Feature")) {
        console.log(duAnCT33Data);
        duAnCT33Data.features.forEach((feature) => {
                       feature.geometry.coordinates.forEach((cord) => {
                    combineArray1.push(swapLatLng(cord));
            });
        });
        console.log("Đã render thành công layer Dự án!");
    } else {
        console.error("File dự án không đúng định dạng GeoJSON chuẩn của Leaflet. Hãy kiểm tra lại cấu trúc file!");
    }
    console.log("combine array", combineArray1);
    // Nạp dữ liệu Dự án Quy hoạch GTVT
    var combineArray2 = [];
    if (duAnCT34Data && (duAnCT34Data.features || duAnCT34Data.type === "Feature")) {
        console.log(duAnCT34Data);
        duAnCT34Data.features.forEach((feature) => {
            var temp = [];
            feature.geometry.coordinates.forEach((cord) => {
                    temp.push(swapLatLng(cord));
            });
            combineArray2.push(temp);
        });
        
        console.log("Đã render thành công layer Dự án!");
    } else {
        console.error("File dự án không đúng định dạng GeoJSON chuẩn của Leaflet. Hãy kiểm tra lại cấu trúc file!");
    }
    console.log("data ", duAnCT34Data);
    console.log("combine array", combineArray2);
    // Nạp dữ liệu Dự án Quy hoạch GTVT
    var combineArray3 = [];
    if (duAnVenBienData && (duAnVenBienData.features || duAnVenBienData.type === "Feature")) {
        console.log(duAnVenBienData);
        duAnVenBienData.features.forEach((feature) => {
            var temp = [];
            feature.geometry.coordinates.forEach((cord) => {
                    temp.push(swapLatLng(cord));
            });
            combineArray3.push(temp);
            
        });
        
        console.log("Đã render thành công layer Dự án!");
    } else {
        console.error("File dự án không đúng định dạng GeoJSON chuẩn của Leaflet. Hãy kiểm tra lại cấu trúc file!");
    }
    PROJECTS.da1.coords = combineArray1;
    PROJECTS.da2.coords = combineArray2;
    PROJECTS.da3.coords = combineArray3;
    
    console.log('project 2', PROJECTS);
    Object.keys(PROJECTS).forEach(function(key) {
    var p = PROJECTS[key];
    var latlngs = p.coords;

    var line = L.polyline(latlngs, {
        className: 'drop-shadow',
        color: p.color,
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round'
    }).addTo(map);

    line.bindTooltip(
        '<b>' + p.badge + '</b><br>' + p.title + '<br><span style="font-size:11px;color:#666">Click để chọn dự án này</span>',
        { sticky: true, opacity: 0.95 }
    );

    // Bind popup, giữ không tự đóng khi click chỗ khác / mở popup khác
    line.bindPopup(
        '<b>' + p.badge + '</b><br>' + p.title,
        { autoClose: true, closeOnClick: true }
    );

    line.on('click', function() {
        document.getElementById('sel-project').value = key;
        onSelectProject(key);
    });

    
    // // MỖI LINE hiện đầu marker ở 2 đầu -- đang bỏ do quá nhiều
    // latlngs.forEach(function(ll, i) {
    //     if (i === 0 || i === latlngs.length - 1 || i % 3 === 0) {
    //     var dotIcon = L.divIcon({
    //         className: '',
    //         html: '<div style="width:10px;height:10px;border-radius:50%;background:' + p.color + ';border:2.5px solid #fff;"></div>',
    //         iconAnchor: [5, 5]
    //     });
    //     L.marker(ll, { icon: dotIcon, interactive: false }).addTo(map);
    //     }
    // });

    layers[key] = line;
    });

    
})
.catch(error => {
    console.error("Lỗi khi load dữ liệu GeoJSON:", error);
});

console.log('project 3', PROJECTS);



function onSelectProject(key) {
    console.log("click project", key);
    Object.keys(layers).forEach(function(k) {
        var p = PROJECTS[k];
        if (key === 'all') {
            layers[k].setStyle({ color: p.color, weight: 5, opacity: 0.9 });
            layers[k].closePopup(); // đóng hết popup khi chọn "all"
        } else if (k === key) {
            layers[k].setStyle({ color: p.color, weight: 8, opacity: 1 });
            layers[k].bringToFront();
        } else {
            layers[k].setStyle({ color: p.color, weight: 3, opacity: 0.6 });
            layers[k].closePopup(); // đóng popup của các line không được chọn
        }
    });

    if (key !== 'all') {
        var p = PROJECTS[key];
        map.fitBounds(layers[key].getBounds(), { padding: [60, 60] });
        updatePanel(key, p);

        layers[key].openPopup(); // mở popup của line vừa chọn, dù chọn từ select2 hay click line
    } else {
        map.setView([10.27, 106.00], 11);
        resetPanel();
    }
}

function updatePanel(key, p) {
  var badge = document.getElementById('proj-badge');
  badge.textContent = p.badge;
  badge.style.background = p.colorBg;
  badge.style.color = p.colorTxt;

  document.getElementById('proj-title').textContent = p.title;
  document.getElementById('proj-sub').textContent = p.sub;
  document.getElementById('m-len').textContent = p.len;
  document.getElementById('m-von').textContent = p.von;

  var pct = p.tiendo;
  var pColor = pct >= 60 ? '#1D9E75' : pct >= 30 ? '#BA7517' : '#D85A30';
  document.getElementById('m-tiendo').innerHTML = '<span style="color:' + pColor + '">' + pct + '%</span>';

  var ttEl = document.getElementById('m-tt');
  ttEl.innerHTML = '<span style="color:' + p.ttColor + ';font-size:13px">' + p.tt + '</span>';

  document.getElementById('pb-pct').textContent = pct + '%';
  var fill = document.getElementById('pb-fill');
  fill.style.width = pct + '%';
  fill.style.background = pColor;

  document.getElementById('n-tg').textContent = p.tg;
  document.getElementById('n-von').textContent = p.vonText;
  document.getElementById('n-qm').textContent = p.quymo;
  document.getElementById('n-gc').textContent = p.ghichu;

  ['nr-tg','nr-von','nr-qm','nr-gc'].forEach(function(id) {
    document.getElementById(id).classList.add('show');
  });

  var cl = document.getElementById('cotmoc-list');
  cl.innerHTML = p.cotmoc.map(function(c) {
    var special = c.indexOf('Cầu') >= 0 || c.indexOf('Phà') >= 0;
    var bg  = special ? '#fef3c7' : p.colorBg;
    var tc  = special ? '#78350f' : p.colorTxt;
    return '<span class="cotmoc-tag" style="background:' + bg + ';color:' + tc + '">' + c + '</span>';
  }).join('');
}

function resetPanel() {
  var badge = document.getElementById('proj-badge');
  badge.textContent = 'Tất cả';
  badge.style.background = '#eee';
  badge.style.color = '#555';

  document.getElementById('proj-title').textContent = 'Chọn dự án để xem chi tiết';
  document.getElementById('proj-sub').textContent = 'Tỉnh Vĩnh Long — 3 dự án đang triển khai';
  document.getElementById('m-len').textContent = '—';
  document.getElementById('m-von').textContent = '—';
  document.getElementById('m-tiendo').textContent = '—';
  document.getElementById('m-tt').textContent = '—';
  document.getElementById('pb-pct').textContent = 'Chọn dự án';
  document.getElementById('pb-fill').style.width = '0%';

  ['nr-tg','nr-von','nr-qm','nr-gc'].forEach(function(id) {
    document.getElementById(id).classList.remove('show');
  });

  document.getElementById('cotmoc-list').innerHTML = '<span class="empty">Chọn dự án để xem danh sách cột mốc</span>';
}



// 3. Hàm xử lý sự kiện chung (Tooltip/Popup) cho các tuyến đường hiện hữu
function onEachRoadFeature(feature, layer) {
    const roadName = feature.properties.name || feature.properties.ref || "Tuyến đường không tên";
    
    //layer.bindTooltip(roadName, { sticky: true, interactive: false, direction: 'top' });

    //click và hiển thị thông tin của shape
    // layer.bindPopup(`
    //     <div style="font-family: Arial, sans-serif;">
    //         <b style="font-size: 14px; color: #333;">Thông tin tuyến đường</b><br>
    //         <hr style="margin: 5px 0; border: 0; border-top: 1px solid #ccc;">
    //         <b>Tên:</b> ${feature.properties.name || 'Chưa cập nhật'}<br>
    //         <b>Mã hiệu (Ref):</b> ${feature.properties.ref || 'Chưa cập nhật'}<br>
    //         <b>Loại mặt đường:</b> ${feature.properties.surface || 'Chưa rõ'}
    //     </div>
    // `, { minWidth: 200 });

    //layer.on({
    //    mouseover: function (e) { e.target.setStyle({ weight: e.target.options.weight + 2, opacity: 1 }); },
    //    mouseout: function (e) { e.target.setStyle({ weight: e.target.options.weight - 2, opacity: e.target.options.color === "#d32f2f" ? 0.85 : 0.8 }); }
   // });
}

// 4. Hàm xử lý sự kiện riêng cho layer Quy hoạch / Dự án
function onEachDuAnFeature(feature, layer) {
    // Tìm thuộc tính tên dự án tùy theo cấu trúc file geojson của bạn (thường là name, TenDuan, hoặc Chức năng...)
    const duAnName = feature.properties.Name || feature.properties.Ten_DuAn || feature.properties.TEN_GOI || "Dự án GTVT Quy Hoạch";

    layer.bindTooltip(`[Dự án] ${duAnName}`, { sticky: true, interactive: false, direction: 'top' });

    // Tạo nội dung popup động hiển thị tất cả các thuộc tính có trong file dự án để bạn dễ theo dõi
    let propertiesHtml = "";
    for (let key in feature.properties) {
        if (feature.properties.hasOwnProperty(key)) {
            propertiesHtml += `<b>${key}:</b> ${feature.properties[key]}<br>`;
        }
    }

    //click và hiển thị thông tin của shape
    // layer.bindPopup(`
    //     <div style="font-family: Arial, sans-serif; max-height: 200px; overflow-y: auto;">
    //         <b style="font-size: 14px; color: #e67e22;">Chi tiết Dự án QH GTVT</b><br>
    //         <hr style="margin: 5px 0; border: 0; border-top: 1px solid #e67e22;">
    //         ${propertiesHtml}
    //     </div>
    // `, { minWidth: 250 });

    layer.on({
        mouseover: function (e) { e.target.setStyle({ weight: 6, opacity: 1 }); },
        mouseout: function (e) { e.target.setStyle({ weight: 4, opacity: 0.9 }); }
    });
}

// Khởi tạo các nhóm layer
const quocLoGroup = L.featureGroup();
const tinhLoGroup = L.featureGroup();

// Tải song song cả 3 file GeoJSON bằng Promise.all
Promise.all([
    fetch(quocLoUrl).then(res => res.json()),
    fetch(tinhLoUrl).then(res => res.json()),
])
.then(([quocLoData, tinhLoData, duAnCT33Data, duAnCT34Data, duAnVenBienData]) => {
    console.log("Đã tải xong toàn bộ dữ liệu nền và dữ liệu dự án!");
    // z-index cao hơn = nằm trên (default overlayPane là 400)

    // Nạp dữ liệu Tỉnh lộ
    L.geoJSON(tinhLoData, { pane: 'paneTinhLo', style: tinhLoStyle, onEachFeature: onEachRoadFeature }).addTo(tinhLoGroup);

    // Nạp dữ liệu Quốc lộ
    L.geoJSON(quocLoData, { pane: 'paneQuocLo', style: quocLoStyle, onEachFeature: onEachRoadFeature }).addTo(quocLoGroup);

  

    // Mặc định hiển thị cả 3 nhóm lên bản đồ
    tinhLoGroup.addTo(map);
    quocLoGroup.addTo(map);

    // 6. Cập nhật bảng điều khiển Bật/Tắt layer ở góc phải
    const overlayMaps = {
        "<span style='color: #1976d2; font-weight: bold;'>Tuyến Tỉnh Lộ</span>": tinhLoGroup,
        "<span style='color: #d32f2f; font-weight: bold;'>Tuyến Quốc Lộ</span>": quocLoGroup,
     
    };
    L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);

    // Tự động căn camera bao quát toàn bộ các layer cộng lại
    const combinedBounds = tinhLoGroup.getBounds()
        .extend(quocLoGroup.getBounds())
       
       ;
    map.fitBounds(combinedBounds);
})
.catch(error => {
    console.error("Lỗi khi load dữ liệu GeoJSON:", error);
});
