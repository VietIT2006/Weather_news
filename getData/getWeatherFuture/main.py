import requests
from bs4 import BeautifulSoup


def tao_widget_thoi_tiet(url, vi_tri='Ho Chi Minh', mau='xanh', kich_thuoc='nho'):
    # Giả lập dữ liệu form (tùy theo trang web thực tế)
    payload = {
        'location': vi_tri,
        'color': mau,
        'size': kich_thuoc
    }

    # Gửi yêu cầu POST đến trang tạo widget
    response = requests.post(url, data=payload)

    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Tìm đoạn mã nhúng widget (giả sử nằm trong thẻ <textarea id="widget-code">)
        widget_code = soup.find('textarea', {'id': 'widget-code'})
        
        if widget_code:
            return widget_code.text
        else:
            return "Không tìm thấy mã widget trong phản hồi."
    else:
        return f"Lỗi khi gửi yêu cầu: {response.status_code}"
    
url_widget = 'https://dubaothoitiet.app/tao-widget'
ma_nhung = tao_widget_thoi_tiet(url_widget, vi_tri='Hà Nội', mau='trắng', kich_thuoc='vừa')
print(ma_nhung)

