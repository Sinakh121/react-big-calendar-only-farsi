import moment from 'jalali-moment'
import momentLocalizer from './moment'

let jmoment = moment
if (jmoment.default) {
  jmoment = jmoment.default
}
jmoment.locale('fa')
const jalaliLocalizer = momentLocalizer(jmoment)

jalaliLocalizer.firstVisibleDay = date => {
  const md = moment.from(date)
  md.locale('fa')
  let firstOfMonth = md.startOf('month').startOf('week')
  return firstOfMonth.toDate()
}

jalaliLocalizer.lastVisibleDay = date => {
  const md = moment.from(date)
  md.locale('fa')
  let endOfMonth = md.endOf('month').endOf('week')
  return endOfMonth.toDate()
}

export default jalaliLocalizer