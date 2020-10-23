import * as core from '@actions/core'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import * as os from 'os'
import * as path from 'path'
import * as client from 'typed-rest-client/HttpClient'

const c: client.HttpClient = new client.HttpClient('vsts-node-api')

async function findVersionLatest(): Promise<string> {
  core.info('Searching the latest version of wasm-bindgen ...')
  const response = await c.get(
    'https://api.github.com/repos/rustwasm/wasm-bindgen/releases/latest'
  )
  const body = await response.readBody()
  return Promise.resolve(JSON.parse(body).tag_name || '0.2.68')
}

async function findVersion(): Promise<string> {
  const version: string = core.getInput('version')
  if (version === 'latest' || version === null || version === undefined) {
    return await findVersionLatest()
  }
  return Promise.resolve(version)
}

async function run(): Promise<void> {
  const tempFolder = path.join(os.tmpdir(), 'setup-wasm-bindgen')
  await io.mkdirP(tempFolder)

  try {
    const version = await findVersion()
    core.info(`Installing wasm-bindgen ${version} ...`)
    const platform = process.env['PLATFORM'] || process.platform
    core.debug(platform)

    let ext = ''
    let arch = ''
    switch (platform) {
      case 'win32':
        ext = '.exe'
        arch = 'x86_64-pc-windows-msvc'
        break
      case 'darwin':
        arch = 'x86_64-apple-darwin'
        break
      case 'linux':
        arch = 'x86_64-unknown-linux-musl'
        break
      default:
        core.setFailed(`Unsupported platform: ${platform}`)
        return
    }
    const archive = `wasm-bindgen-${version}-${arch}`
    const url = `https://github.com/rustwasm/wasm-bindgen/releases/download/${version}/${archive}.tar.gz`
    core.info(`Downloading wasm-bindgen from ${url} ...`)
    const downloadArchive = await tc.downloadTool(url)
    core.info(`Extracting wasm-bindgen to ${tempFolder} ...`)
    const extractedFolder = await tc.extractTar(downloadArchive, tempFolder)
    const execFolder = path.join(os.homedir(), '.cargo', 'bin')
    await io.mkdirP(execFolder)
    const execNames = ['wasm-bindgen', 'wasm-bindgen-test-runner', 'wasm2es6js']
    for (const execName of execNames) {
      const exec = `${execName}${ext}`
      const execPath = path.join(execFolder, exec)
      await io.mv(path.join(extractedFolder, archive, exec), execPath)
      core.info(`Installed ${execName} to ${execPath} 🎉`)
    }
    await io.rmRF(path.join(extractedFolder, archive))
  } catch (error) {
    core.setFailed(error.message)
  } finally {
    io.rmRF(tempFolder)
  }
}

run().then(
  () => core.info('Done'),
  err => core.error(err)
)
