function Time() {
	this._year = 2010;
	this._month = 0;
	this._day = 1;
	this._hour = 0;
	this._minute = 0;
	this._second = 0;
}

Time.days_in_month = function(month, year) {
	return 32 - new Date(year, month, 32).getDate();
}

Time.prototype = {
	get year() {
		return this._year;
	},
	set year(y) {
		this._year = y;
	},
	get month() {
		return this._month;
	},
	set month(m) {
		while (m > 11) {
			this.year++;
			m -= 12;
		}
		this._month = m;
	},
	get day() {
		return this._day;
	},
	set day(d) {
		while (d > Time.days_in_month(this._month)) {
			this.month++;
			d -= Time.days_in_month(this._month);
		}
		this._day = d;
	},
	get hour() {
		return this._hour;
	},
	set hour(h) {
		while (h > 23) {
			this.day++;
			h -= 24;
		}
		this._hour = h;
	},
	get minute() {
		return this._minute;
	},
	set minute(m) {
		while (m > 59) {
			this.hour++;
			m -= 60;
		}
		this._minute = m;
	},
	get second() {
		return this._second;
	},
	set second(s) {
		while (s > 59) {
			this.minute++;
			s -= 60;
		}
		this._second = s;
	}
}

Time.prototype.get_time = function(feedback) {
	feedback.time = {
		year: this.year,
		month: this.month,
		day: this.day,
		hour: this.hour,
		minute: this.minute,
		second: this.second
	}
	return feedback;
}

exports.Time = Time;