/* eslint no-fallthrough: off */
import * as dates from 'date-arithmetic-only-farsi'
import moment from 'jalali-moment'
import momentGregorian from 'moment'

export {
  milliseconds,
  seconds,
  minutes,
  hours,
  // month,
  startOf,
  endOf,
  add,
  eq,
  gte,
  gt,
  lte,
  lt,
  inRange,
  min,
  max,
} from 'date-arithmetic-only-farsi'

const MILLI = {
  seconds: 1000,
  minutes: 1000 * 60,
  hours: 1000 * 60 * 60,
  day: 1000 * 60 * 60 * 24,
}

const MONTHS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

function monthJalali(date, args) {
  const m = moment(date)
  return m.month(args)
}

export function monthsInYear(year) {
  let date = new Date(year, 0, 1)

  return MONTHS.map(i => dates.month(date, i))
}

export function firstVisibleDay(date, localizer) {
  let firstOfMonth = dates.startOf(date, 'month')
  return dates.startOf(firstOfMonth, 'week', localizer.startOfWeek())
}

function lastVisibleDay(date, localizer) {
  let endOfMonth = dates.endOf(date, 'month')
  return dates.endOf(endOfMonth, 'week', localizer.startOfWeek())
}

function lastVisibleDayJalali(date, localizer) {
  let a = firstVisibleDay(date, localizer)
  a = moment(a).add(1, 'jMonth').toJSON().toString().slice(0, 10) //real last day of month
  let endOfMonth = dates.endOf(date, 'month')
  let lastVisibleDay = dates.endOf(endOfMonth, 'week', localizer.startOfWeek())
  return lastVisibleDay
}

function removeDuplicates(dayslist) {
  const list = dayslist.map(date => date.toJSON().toString().slice(0, 10))
  return Array.from(new Set(list)).map(date => moment(new Date(date)).startOf('day').toDate())
}

function visibleDays(date, localizer) {
  let current = firstVisibleDay(date, localizer),
    last = lastVisibleDay(date, localizer),
    days = []

  while (dates.lte(current, last, 'day')) {
    days.push(current)
    current = dates.add(current, 1, 'day')
  }

  function dayNumber(date){
    return parseInt(date.toJSON().toString().slice(8, 10), 10)
  }

  function addDays(diff) {
    const lastday = uniqueDaysList[uniqueDaysList.length - 1];
    for (let i = 1; i < diff + 1; i++) {
      uniqueDaysList.push(momentGregorian(lastday).add(i, 'days').toDate())
    }
  }
  
  let uniqueDaysList = removeDuplicates(days)
  
  // //remove extra day
  if (uniqueDaysList.length === 36 || uniqueDaysList.length === 43) uniqueDaysList.pop()
  
  const realLastDayOfMonth = dayNumber(momentGregorian(uniqueDaysList[15]).endOf('month'))
  const lastViewingDay = dayNumber(momentGregorian(uniqueDaysList[uniqueDaysList.length - 1]).add(1, 'day').toDate())

  //add last row if neccessary
  const difference = Math.abs(realLastDayOfMonth - lastViewingDay)
  if (difference > 0 && difference < 5 && lastViewingDay > 20) addDays(7)

  debugger;
  console.log('what?');
  
  //remove first extra row
  if (dayNumber(uniqueDaysList[8]) === 1){
    uniqueDaysList.splice(0,7)
  }

  return uniqueDaysList
}

function visibleDaysJalali(date, localizer) {
  let current = firstVisibleDay(date, localizer),
    last = lastVisibleDay(date, localizer),
    days = []

  while (dates.lte(current, last, 'day')) {
    days.push(current)
    current = dates.add(current, 1, 'day')
  }

  // removing duplicate dates
  function removeDuplicates(dayslist) {
    const list = dayslist.map(date => date.toJSON().toString().slice(0, 10))
    return Array.from(new Set(list)).map(date => moment(new Date(date)).startOf('day').toDate())
  }
  let uniqueDaysList = removeDuplicates(days)

  // adjusting the visibale days in 5 or 6 rows
  const len = uniqueDaysList.length
  const lastday = uniqueDaysList[len - 1]
  const diff35 = 35 - len
  const diff42 = 42 - len

  function addDays(diff) {
    for (let i = 1; i < diff + 1; i++) {
      uniqueDaysList.push(moment(lastday).add(i, 'days').toDate())
    }
  }

  function subtractDays(diff) {
    uniqueDaysList.splice(0, Math.abs(diff))
  }

  // handle 5 or 6 rows
  if (len < 35) {
    addDays(diff35)
  } else if (len > 35 && len < 42) {
    if (diff42 < 5) {
      addDays(diff42)
    } else {
      subtractDays(diff35)
    }
  } else if (len > 42) {
    subtractDays(diff42)
  }

  //Sat-Fri conflict removal
  if (uniqueDaysList[0].getDay() === 5) {
    subtractDays(1)
    addDays(1)
  }

  //duplicate last days of month correction
  if (
    moment(uniqueDaysList[uniqueDaysList.length - 1]).format() ===
    moment(uniqueDaysList[uniqueDaysList.length - 2]).format()
  ) {
    uniqueDaysList.splice(-1)
    uniqueDaysList.push(
      moment(uniqueDaysList[uniqueDaysList.length - 1])
        .add(1, 'day')
        .toDate()
    )
  }

  //leap year correction
  const monthItem = moment(uniqueDaysList[15])
  const daysInMonth = monthItem.jDaysInMonth(monthItem.jMonth)
  const lastDayOfMonthNumber = moment(
    uniqueDaysList[uniqueDaysList.length - 1]
  ).jDate()
  const leapDiff = daysInMonth - lastDayOfMonthNumber
  if (leapDiff > 0 && leapDiff < 4) {
    addDays(9)
    uniqueDaysList = removeDuplicates(uniqueDaysList)
  }

  // remove extra days
  const extraDays = uniqueDaysList.length - 42
  if (extraDays > 0) {
    subtractDays(extraDays)
  }

  // remove extra inactive last row
  if (moment(uniqueDaysList[uniqueDaysList.length - 1]).jDate() === 7) {
    uniqueDaysList.splice(-7)
  }

  return uniqueDaysList
}

export function ceil(date, unit) {
  let floor = dates.startOf(date, unit)

  return dates.eq(floor, date) ? floor : dates.add(floor, 1, unit)
}

export function range(start, end, unit = 'day') {
  let current = start,
    days = []

  while (dates.lte(current, end, unit)) {
    days.push(current)
    current = dates.add(current, 1, unit)
  }

  return days
}

export function merge(date, time) {
  if (time == null && date == null) return null

  if (time == null) time = new Date()
  if (date == null) date = new Date()

  date = dates.startOf(date, 'day')
  date = dates.hours(date, dates.hours(time))
  date = dates.minutes(date, dates.minutes(time))
  date = dates.seconds(date, dates.seconds(time))
  return dates.milliseconds(date, dates.milliseconds(time))
}

export function eqTime(dateA, dateB) {
  return (
    dates.hours(dateA) === dates.hours(dateB) &&
    dates.minutes(dateA) === dates.minutes(dateB) &&
    dates.seconds(dateA) === dates.seconds(dateB)
  )
}

export function isJustDate(date) {
  return (
    dates.hours(date) === 0 &&
    dates.minutes(date) === 0 &&
    dates.seconds(date) === 0 &&
    dates.milliseconds(date) === 0
  )
}

export function duration(start, end, unit, firstOfWeek) {
  if (unit === 'day') unit = 'date'
  return Math.abs(
    dates[unit](start, undefined, firstOfWeek) -
      dates[unit](end, undefined, firstOfWeek)
  )
}

export function diff(dateA, dateB, unit) {
  if (!unit || unit === 'milliseconds') return Math.abs(+dateA - +dateB)

  // the .round() handles an edge case
  // with DST where the total won't be exact
  // since one day in the range may be shorter/longer by an hour
  return Math.round(
    Math.abs(
      +dates.startOf(dateA, unit) / MILLI[unit] -
        +dates.startOf(dateB, unit) / MILLI[unit]
    )
  )
}

export function total(date, unit) {
  let ms = date.getTime(),
    div = 1

  switch (unit) {
    case 'week':
      div *= 7
    case 'day':
      div *= 24
    case 'hours':
      div *= 60
    case 'minutes':
      div *= 60
    case 'seconds':
      div *= 1000
  }

  return ms / div
}

export function week(date) {
  var d = new Date(date)
  d.setHours(0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7 + 1) / 7)
}

export function today() {
  return dates.startOf(new Date(), 'day')
}

export function yesterday() {
  return dates.add(dates.startOf(new Date(), 'day'), -1, 'day')
}

export function tomorrow() {
  return dates.add(dates.startOf(new Date(), 'day'), 1, 'day')
}

export { lastVisibleDayJalali as lastVisibleDay }
export { visibleDaysJalali as visibleDays }
export { monthJalali as month }
