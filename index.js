window.onload = function () {
    document.body.classList.add('loaded_hiding');
    window.setTimeout(function () {
        document.body.classList.add('loaded');
        document.body.classList.remove('loaded_hiding');
    }, 500);
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;
        console.log("Latitude: " + latitude + " Longitude: " + longitude);
        // DOM елементи
        const todayWeather = document.querySelector('.today-weather');
        const iconElement = todayWeather.querySelector('.today-weather__icon');
        const descriptionElement = todayWeather.querySelector('.today-weather__icon-descrition');
        const tempElement = todayWeather.querySelector('.today-weather__temp');
        const windElement = todayWeather.querySelector('.today-weather__wind');

        // API ключ
        const apiKey = '6d193098eb89977edb2e3927f734d59e';

        // Поточна погода

        // Запит до API
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=f66e20fc6a3633fa932ce5bfeb9e027b`;

        fetch(url)
        .then(response => response.json())
        .then(data => {
            // Отримуємо дані про погоду
            const icon = data.weather[0].icon;
            const description = data.weather[0].description;
            const temperature = Math.round(data.main.temp- 273.15);
            const windSpeed = data.wind.speed;
            const windDirection = degreesToDirection(data.wind.deg);

            // Заповнюємо картку
            iconElement.innerHTML = `<img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}">`;
            descriptionElement.textContent = description;
            tempElement.textContent = `${temperature} °C`;
            windElement.textContent = `Wind: ${windSpeed} m/s, ${windDirection}°`;
            createCity(data);
            console.log(data);
        })
        .catch(error => console.log(error));

        // Погода на 5 днів
        const currentDate = new Date();
        const next5Days = new Array(4).fill(0).map((_, i) => new Date(currentDate.getTime() + (24 * 60 * 60 * 1000) * (i + 1)).toISOString().split('T')[0]);
        const urlAllDay = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=f66e20fc6a3633fa932ce5bfeb9e027b`;
        
        fetch(urlAllDay)
        .then(response => response.json())
        .then(data => {
            const dailyData = {};
            const dailyDataArr = [];
        
            data.list.forEach(item => {
                const date = item.dt_txt.split(' ')[0];
                const time = item.dt_txt.split(' ')[1].slice(0, -3);
        
                if (!next5Days.includes(date) || (time !== '00:00' && time !== '06:00' && time !== '12:00' && time !== '18:00')) {
                    return;
                }
        
                if (!dailyData[date]) {
                    dailyData[date] = {
                        date: new Date(date),
                        dayOfWeek: '',
                        icon: '',
                        maxTemp: -Infinity,
                        minTemp: Infinity,
                        hourlyData: [],
                    };
                    dailyDataArr.push(dailyData[date]);
                }
        
                const dayData = dailyData[date];
        
                if (item.main.temp_max > dayData.maxTemp) {
                    dayData.maxTemp = Math.round(item.main.temp_max - 273.15);
                }
        
                if (item.main.temp_min < dayData.minTemp) {
                    dayData.minTemp = Math.round(item.main.temp_min - 273.15);
                }
        
                dayData.hourlyData.push({
                    time: time,
                    temp: Math.round(item.main.temp - 273.15),
                    icon: item.weather[0].icon,
                });
            });
        
            dailyDataArr.forEach(dayData => {
                const day = dayData.date.toLocaleDateString('en-US', {day: 'numeric', month: 'short'});
                const dayOfWeek = dayData.date.toLocaleDateString('en-US', { weekday: 'long' });
                dayData.dayOfWeek = dayOfWeek;
        
                const cardHTML = `
                <div class="card">
                <div class="card-header">
                    <h2>${day}</h2>
                    <p>${dayData.dayOfWeek}</p>
                </div>
                <div class="card-body">
                    <img src="http://openweathermap.org/img/wn/${dayData.hourlyData[0].icon}.png" alt="weather icon">
                    <p>${Math.round(dayData.maxTemp)}° / ${Math.round(dayData.minTemp)}°</p>
                </div>
                <table>
                    <tr>
                    <th>Time</th>
                    <th>Weather</th>
                    <th>Temp</th>
                    </tr>
                    ${dayData.hourlyData.map(hourData => `
                    <tr>
                        <td>${hourData.time}</td>
                        <td><img src="http://openweathermap.org/img/wn/${hourData.icon}.png" alt="weather icon"></td>
                        <td>${Math.round(hourData.temp)}°</td>
                    </tr>
                    `).join('')}
                </table>
                </div>
            `;
            document.querySelector('.main__forecasts').insertAdjacentHTML('beforeend', cardHTML);
            });
        })
        .catch(error => console.log(error));

    });
} else {
    console.log("Geolocation is not supported by this browser.");
}
function createCity(data){
    let city = document.querySelector('.header__city');
    city.innerHTML= `<p>${data.name}</p>
                    <img src='https://cdn-icons-png.flaticon.com/512/1180/1180805.png?w=740&t=st=1680158714~exp=1680159314~hmac=0cd6c51848e76eef58ff07170baba7ca1c956e889b10cb3be880b8743274328f' width=37px height=37px/>`;
}

const date = new Date();
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const headerDate = document.querySelector('.header__date');
const dayOfWeek = daysOfWeek[date.getDay()];
const month = months[date.getMonth()];
const dayOfMonth = date.getDate();

headerDate.textContent = ` ${dayOfMonth} ${month}, ${dayOfWeek}`;

function degreesToDirection(degrees) {
    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(degrees / (360 / directions.length)) % directions.length;
    return directions[index];
}



