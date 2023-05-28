const select = document.querySelector('select')
const divResult = document.querySelector('#result')
const form = document.querySelector('form')
const inputDate = document.querySelector('input[type="date"]')
let date = new Date().toLocaleDateString('pt-br')
    .replace(/\//g, '-')
const year = date.split('-')
const dateSet = year.reverse().join().toString().replace(/,/g, '-')
inputDate.setAttribute('value', dateSet)
const input = document.querySelector('input[type="text"]')
const change = document.querySelectorAll('input[type="radio"]')
const changeLabel = document.querySelectorAll('.change label')
let calc = false
const submit = document.querySelector('input[type="submit"]')

change.forEach(el => {
    el.addEventListener('change', () => {
        changeLabel.forEach(el => el.classList.toggle('inactive'))
        if (calc) {
            submit.click()
        }
    })
});

input.addEventListener('input', function () {
    console.log(11)
    this.value = this.value
        .replace(/[^0-9.|,]/g, '')
        .replace(/(\*?)\*/g, '$1');
})

form.addEventListener('submit', (e) => {
    e.preventDefault()
    calc = true
    const moeda = form.moeda.value
    const value = form.valor.value
    dateSplit = form.date.value.split('-')
    date = `${dateSplit[1]}-${dateSplit[2] > 10 ? dateSplit[2] : '0' + dateSplit[2]}-${dateSplit[0]}`
    yearNum = dateSplit[2]
    dateUtil(dateSplit[2])
    result(moeda, date, value)
})
const dateUtil = (param) => {
    const dat = new Date(form.date.value)
    switch (dat.getDay()) {
        case 6:
            yearNum = parseInt(yearNum) - 2
            date = date.replace(param, yearNum)
            break;
        case 5:
            yearNum = parseInt(yearNum) - 1
            date = date.replace(param, yearNum)
            break;
        default:
            break;
    }
    return date
}

const moedas = async () => {
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas?$top=100&$format=json`

    const moedas = await fetch(url)
        .then(res => { if (res.ok) return res.json() })
        .catch(error => console.log(error))

    moedas.value.map(el => {
        if (el.simbolo !== "USD") {
            select.innerHTML +=
                `<option value="${el.simbolo}">${el.nomeFormatado}</option>`
        } else {
            select.innerHTML +=
                `<option value="${el.simbolo}" selected>${el.nomeFormatado}</option>`
        }
    });
}
moedas()

const result = async (param1, param2, param3) => {
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${param1}'&@dataCotacao='${param2}'&$top=100&$format=json&$select=cotacaoCompra,cotacaoVenda,dataHoraCotacao`

    const valor = await fetch(url)
        .then(res => { if (res.ok) return res.json() })
        .catch(error => console.log(error))

    if (valor.value.length !== 0) {
        const dir = form.direction.value
        let real = 0
        if (dir === '/brl') {
            real = parseFloat(param3) / valor.value[4].cotacaoVenda
        } else {
            param1 = "BRL"
            real = parseFloat(param3) * valor.value[4].cotacaoVenda
        }
        const res = document.querySelector('#result div')
        res.parentNode.classList.remove('none')
        res.innerHTML = `<div style="padding: 1em;
    border: 1px solid #ced4da;
    border-radius: 5px;
    display: inline-block;
    font-size: 1.2em;
    margin: .5em 0">
    <p><span class="bold">Data ultilizada: </span> ${param2.replace(/-/g, '/')}</p>
    <p><span class="bold">Valor: </span> ${real.toLocaleString('pt-br', { style: 'currency', currency: `${param1}` })}
    </div>`
    } else {
        dateSplit = form.date.value.split('-')
        dateUtil(dateSplit[2])
        return result
    }
}
