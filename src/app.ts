import { constants, createWriteStream, promises as fs, WriteStream } from 'fs'
import readline from 'readline'

const ANSWERS = {
  YES: ['yes', 'da', 'да', '+'],
  NO: ['no', 'net', 'нет', '-', ''],
}

const outputPath = './output'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
})

let countOfRenamed = 0

const prompt = (query: string) => {
  return new Promise((resolve: (answer: string) => void) => rl.question(query, resolve))
}

async function processDirectory({
  source,
  file,
  parentName,
  replacedName,
  newName,
}: {
  source: string
  file: WriteStream
  parentName?: string
  replacedName?: string
  newName?: string
}) {
  const items = await fs.readdir(source, { withFileTypes: true })

  for (const item of items) {
    if (item.isDirectory()) {
      let renamedDir = item.name

      if (replacedName && item.name.includes(replacedName) && newName) {
        renamedDir = renamedDir.replace(replacedName, newName)

        await fs.rename(`${item.path}/${item.name}`, `${item.path}/${renamedDir}`)
        countOfRenamed++
      }

      await processDirectory({
        source: `${item.path}/${renamedDir}`,
        file,
        parentName: renamedDir,
        newName,
        replacedName,
      })
      parentName && file.write(`${parentName}_${renamedDir}\n`)
    }
  }
}

const app = async () => {
  try {
    const source = await prompt('Введите путь проверяемой папки: ')
    const fileNameOutput = await prompt('Введите название файла вывода: ')
    const wantRename = await prompt('Хотите переименовать папки? (default: no)')

    let replacedFolderName: string | undefined = undefined
    let newFolderName: string | undefined = undefined

    const isRename = ANSWERS.YES.includes(wantRename.toLowerCase())

    if (isRename) {
      replacedFolderName = await prompt('Введите имя заменяемой папки: ')
      newFolderName = await prompt('Введите новое имя папки: ')
    }

    await fs
      .access(outputPath, constants.R_OK | constants.W_OK)
      .catch(async () => await fs.mkdir(outputPath))

    const file = createWriteStream(`${outputPath}/${fileNameOutput}.txt`)

    await processDirectory({
      file,
      source,
      replacedName: replacedFolderName,
      newName: newFolderName,
    })
    file.end()

    console.log('Запись завершена!')
    isRename && console.log(`Кол-во переменованных папок: ${countOfRenamed}`)
  } catch (e) {
    console.error(e)
  }
}

app()
