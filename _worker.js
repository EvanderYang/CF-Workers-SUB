// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; // 可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; // 可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; // 可以为空，或者@userinfobot中获取，/start
let TG = 0; // 小白勿动，开发者专用，1为推送所有的访问信息，0为不推送订阅转换后端的访问信息与异常访问
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; // 自定义订阅更新时间，单位小时
let total = 99; // TB
let timestamp = 4102329600000; // 2099-12-31

// 节点链接 + 订阅链接
let MainData = `
https://raw.githubusercontent.com/mfuu/v2ray/master/v2ray
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; // 在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; // 订阅配置文件
let subProtocol = 'https';

export default {
    async fetch(request, env) {
        const userAgentHeader = request.headers.get('User-Agent');
        const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
        const url = new URL(request.url);
        const token = url.searchParams.get('token');
        mytoken = env.TOKEN || mytoken;
        BotToken = env.TGTOKEN || BotToken;
        ChatID = env.TGID || ChatID;
        TG = env.TG || TG;
        subConverter = env.SUBAPI || subConverter;
        if (subConverter.includes("http://")) {
            subConverter = subConverter.split("//")[1];
            subProtocol = 'http';
        } else {
            subConverter = subConverter.split("//")[1] || subConverter;
        }
        subConfig = env.SUBCONFIG || subConfig;
        FileName = env.SUBNAME || FileName;

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const timeTemp = Math.ceil(currentDate.getTime() / 1000);
        const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
        guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
        if (!guestToken) guestToken = await MD5MD5(mytoken);
        const 访客订阅 = guestToken;

        let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
        total = total * 1099511627776;
        let expire = Math.floor(timestamp / 1000);
        SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

        if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
            if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico")
                await sendMessage(`#异常访问 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgent}</tg-spoiler>\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);
            if (env.URL302)
                return Response.redirect(env.URL302, 302);
            else if (env.URL)
                return await proxyURL(env.URL, url);
            else
                return new Response(await nginx(), {
                    status: 200,
                    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
                });
        } else {
            if (env.KV) {
                await 迁移地址列表(env, 'LINK.txt');
                if (userAgent.includes('mozilla') && !url.search) {
                    await sendMessage(`#编辑订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);
                    return await KV(request, env, 'LINK.txt', 访客订阅);
                } else {
                    MainData = await env.KV.get('LINK.txt') || MainData;
                }
            } else {
                MainData = env.LINK || MainData;
                if (env.LINKSUB) urls = await ADD(env.LINKSUB);
            }
            let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
            let 自建节点 = "";
            let 订阅链接 = "";
            for (let x of 重新汇总所有链接) {
                if (x.toLowerCase().startsWith('http')) {
                    订阅链接 += x + '\n';
                } else {
                    自建节点 += x + '\n';
                }
            }
            MainData = 自建节点;
            urls = await ADD(订阅链接);
            await sendMessage(`#获取订阅 ${FileName}`, request.headers.get('CF-Connecting-IP'), `UA: ${userAgentHeader}</tg-spoiler>\n域名: ${url.hostname}\n入口: ${url.pathname + url.search}`);

            let 订阅格式 = 'base64';
            if (
                userAgent.includes('null') ||
                userAgent.includes('subconverter') ||
                userAgent.includes('nekobox') ||
                userAgent.includes(('CF-Workers-SUB').toLowerCase())
            ) {
                订阅格式 = 'base64';
            } else if (userAgent.includes('clash') || (url.searchParams.has('clash') && !userAgent.includes('subconverter'))) {
                订阅格式 = 'clash';
            } else if (userAgent.includes('sing-box') || userAgent.includes('singbox') || ((url.searchParams.has('sb') || url.searchParams.has('singbox')) && !userAgent.includes('subconverter'))) {
                订阅格式 = 'singbox';
            } else if (userAgent.includes('surge') || (url.searchParams.has('surge') && !userAgent.includes('subconverter'))) {
                订阅格式 = 'surge';
            } else if (userAgent.includes('quantumult%20x') || (url.searchParams.has('quanx') && !userAgent.includes('subconverter'))) {
                订阅格式 = 'quanx';
            } else if (userAgent.includes('loon') || (url.searchParams.has('loon') && !userAgent.includes('subconverter'))) {
                订阅格式 = 'loon';
            }

            let subConverterUrl;
            let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
            let req_data = MainData;

            let 追加UA = 'v2rayn';
            if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
            else if (url.searchParams.has('clash')) 追加UA = 'clash';
            else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
            else if (url.searchParams.has('surge')) 追加UA = 'surge';
            else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
            else if (url.searchParams.has('loon')) 追加UA = 'Loon';

            const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.());
            if (订阅链接数组.length > 0) {
                const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
                req_data += 请求订阅响应内容[0].join('\n');
                订阅转换URL += "|" + 请求订阅响应内容[1];
            }

            if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
            // 修复中文错误
            const utf8Encoder = new TextEncoder();
            const encodedData = utf8Encoder.encode(req_data);
            const utf8Decoder = new TextDecoder();
            const text = utf8Decoder.decode(encodedData);

            // 去重
            const uniqueLines = new Set(text.split('\n'));
            const result = [...uniqueLines].join('\n');

            let base64Data;
            try {
                base64Data = btoa(result);
            } catch (e) {
                function encodeBase64(data) {
                    const binary = new TextEncoder().encode(data);
                    let base64 = '';
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

                    for (let i = 0; i < binary.length; i += 3) {
                        const byte1 = binary[i];
                        const byte2 = binary[i + 1] || 0;
                        const byte3 = binary[i + 2] || 0;

                        base64 += chars[byte1 >> 2];
                        base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
                        base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
                        base64 += chars[byte3 & 63];
                    }

                    const padding = 3 - (binary.length % 3 || 3);
                    return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
                }
                base64Data = encodeBase64(result);
            }

            if (订阅格式 == 'base64' || token == fakeToken) {
                return new Response(base64Data, {
                    headers: {
                        "content-type": "text/plain; charset=utf-8",
                        "Profile-Update-Interval": `${SUBUpdateTime}`,
                    }
                });
            } else if (订阅格式 == 'clash') {
                subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false`;
            } else if (订阅格式 == 'singbox') {
                subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false`;
            } else if (订阅格式 == 'surge') {
                subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false`;
            } else if (订阅格式 == 'quanx') {
                subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false`;
            } else if (订阅格式 == 'loon') {
                subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false`;
            }

            try {
                const subConverterResponse = await fetch(subConverterUrl);

                if (!subConverterResponse.ok) {
                    return new Response(base64Data, {
                        headers: {
                            "content-type": "text/plain; charset=utf-8",
                            "Profile-Update-Interval": `${SUBUpdateTime}`,
                        }
                    });
                }
                let subConverterContent = await subConverterResponse.text();
                if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
                return new Response(subConverterContent, {
                    headers: {
                        "Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`,
                        "content-type": "text/plain; charset=utf-8",
                        "Profile-Update-Interval": `${SUBUpdateTime}`,
                    },
                });
            } catch (error) {
                return new Response(base64Data, {
                    headers: {
                        "content-type": "text/plain; charset=utf-8",
                        "Profile-Update-Interval": `${SUBUpdateTime}`,
                    }
                });
            }
        }
    }
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function sendMessage(type, ip, add_data = "") {
	if (BotToken !== '' && ChatID !== '') {
		let msg = "";
		const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
		if (response.status == 200) {
			const ipInfo = await response.json();
			msg = `${type}\nIP: ${ip}\n国家: ${ipInfo.country}\n<tg-spoiler>城市: ${ipInfo.city}\n组织: ${ipInfo.org}\nASN: ${ipInfo.as}\n${add_data}`;
		} else {
			msg = `${type}\nIP: ${ip}\n<tg-spoiler>${add_data}`;
		}

		let url = "https://api.telegram.org/bot" + BotToken + "/sendMessage?chat_id=" + ChatID + "&parse_mode=HTML&text=" + encodeURIComponent(msg);
		return fetch(url, {
			method: 'get',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;',
				'Accept-Encoding': 'gzip, deflate, br',
				'User-Agent': 'Mozilla/5.0 Chrome/90.0.4430.72'
			}
		});
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
	const url = new URL(request.url);
	try {
		// POST请求处理
		if (request.method === "POST") {
			if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
			try {
				const content = await request.text();
				await env.KV.put(txt, content);
				return new Response("保存成功");
			} catch (error) {
				console.error('保存KV时发生错误:', error);
				return new Response("保存失败: " + error.message, { status: 500 });
			}
		}

		// GET请求部分
		let content = '';
		let hasKV = !!env.KV;

		if (hasKV) {
			try {
				content = await env.KV.get(txt) || '';
			} catch (error) {
				console.error('读取KV时发生错误:', error);
				content = '读取数据时发生错误: ' + error.message;
			}
		}

		const html = `
			<!DOCTYPE html>
<html lang="zh-CN">
				<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CF-Workers-SUB 订阅管理器</title>
					<style>
        * {
							margin: 0;
            padding: 0;
							box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
							margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            color: white;
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 1.1rem;
        }

        .section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .section:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }

        .section-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 20px 24px;
            font-size: 1.3rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-header::before {
            content: '';
            width: 4px;
            height: 24px;
            background: rgba(255,255,255,0.8);
            border-radius: 2px;
        }

        .section-content {
            padding: 24px;
        }

        /* 上区：订阅区域样式 */
        .subscription-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }

        .subscription-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            padding: 20px;
            border: 2px solid transparent;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .subscription-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
        }

        .subscription-card:hover {
            border-color: #4f46e5;
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(79, 70, 229, 0.2);
        }

        .subscription-title {
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 12px;
            font-size: 1.1rem;
        }

        .subscription-link {
            display: block;
            color: #4f46e5;
            text-decoration: none;
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            transition: all 0.3s ease;
            word-break: break-all;
            font-size: 0.9rem;
            margin-bottom: 12px;
        }

        .subscription-link:hover {
            border-color: #4f46e5;
            background: #f8fafc;
            transform: scale(1.02);
        }

        .qr-container {
            display: flex;
            justify-content: center;
            margin-top: 12px;
            min-height: 120px;
            align-items: center;
        }

        .guest-toggle {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 20px 0;
            display: block;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
        }

        .guest-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
        }

        .guest-section {
            margin-top: 20px;
            padding: 20px;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border-radius: 12px;
            border-left: 4px solid #10b981;
        }

        /* 中区：编辑器样式 */
        .editor-container {
            position: relative;
        }

						.editor {
							width: 100%;
            min-height: 300px;
            padding: 20px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            line-height: 1.6;
            background: #fafafa;
            transition: all 0.3s ease;
            resize: vertical;
        }

        .editor:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
            background: white;
        }

        .editor-actions {
							display: flex;
            gap: 12px;
							align-items: center;
            margin-top: 16px;
            flex-wrap: wrap;
						}

        .save-btn {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
							color: white;
							border: none;
            padding: 12px 24px;
            border-radius: 8px;
							cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            min-width: 100px;
        }

        .save-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
        }

        .save-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .save-status {
            color: #6b7280;
            font-weight: 500;
            padding: 8px 16px;
            background: #f3f4f6;
            border-radius: 6px;
            transition: all 0.3s ease;
        }

        /* 下区：配置信息样式 */
        .config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
        }

        .config-item {
            background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
            padding: 16px;
            border-radius: 10px;
            border-left: 4px solid #f59e0b;
        }

        .config-label {
            font-weight: 600;
            color: #92400e;
            font-size: 0.9rem;
            margin-bottom: 6px;
        }

        .config-value {
            color: #1f2937;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            word-break: break-all;
            background: rgba(255,255,255,0.7);
            padding: 8px 12px;
            border-radius: 6px;
        }

        /* 信息区样式 */
        .info-section {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
        }

        .info-section .section-header {
            background: rgba(0,0,0,0.2);
        }

        .info-links {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            justify-content: center;
            margin-top: 20px;
        }

        .info-link {
            color: #60a5fa;
            text-decoration: none;
            padding: 10px 20px;
            background: rgba(96, 165, 250, 0.1);
            border-radius: 8px;
            border: 1px solid rgba(96, 165, 250, 0.3);
            transition: all 0.3s ease;
            font-weight: 500;
        }

        .info-link:hover {
            background: rgba(96, 165, 250, 0.2);
            border-color: #60a5fa;
            transform: translateY(-2px);
        }

        .user-agent {
            margin-top: 16px;
            padding: 12px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
            font-family: monospace;
            font-size: 0.85rem;
            word-break: break-all;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
            .container {
                padding: 16px;
            }

            .header h1 {
                font-size: 2rem;
            }

            .subscription-grid {
                grid-template-columns: 1fr;
            }

            .section-content {
                padding: 16px;
            }

            .info-links {
                flex-direction: column;
                align-items: center;
            }
        }

        /* 加载动画 */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* 成功/错误状态 */
        .status-success {
            color: #059669 !important;
            background: #ecfdf5 !important;
        }

        .status-error {
            color: #dc2626 !important;
            background: #fef2f2 !important;
        }

        /* 渐入动画 */
        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
						}
					</style>
					<script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
				</head>
				<body>
    <div class="container">
        <!-- 头部 -->
        <div class="header fade-in">
            <h1>🚀 CF-Workers-SUB</h1>
            <p>高性能订阅聚合与转换服务</p>
					</div>

        <!-- 上区：订阅区域 -->
        <div class="section fade-in">
            <div class="section-header">
                📡 订阅地址管理
            </div>
            <div class="section-content">
                <div class="subscription-grid">
                    <!-- 自适应订阅 -->
                    <div class="subscription-card">
                        <div class="subscription-title">🔄 自适应订阅</div>
                        <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sub','qr_auto')">
                            https://${url.hostname}/${mytoken}
                        </a>
                        <div id="qr_auto" class="qr-container"></div>
                    </div>

                    <!-- Base64订阅 -->
                    <div class="subscription-card">
                        <div class="subscription-title">📄 Base64订阅</div>
                        <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qr_base64')">
                            https://${url.hostname}/${mytoken}?b64
                        </a>
                        <div id="qr_base64" class="qr-container"></div>
                    </div>

                    <!-- Clash订阅 -->
                    <div class="subscription-card">
                        <div class="subscription-title">⚔️ Clash订阅</div>
                        <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qr_clash')">
                            https://${url.hostname}/${mytoken}?clash
                        </a>
                        <div id="qr_clash" class="qr-container"></div>
                    </div>

                    <!-- Singbox订阅 -->
                    <div class="subscription-card">
                        <div class="subscription-title">📦 Singbox订阅</div>
                        <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qr_singbox')">
                            https://${url.hostname}/${mytoken}?sb
                        </a>
                        <div id="qr_singbox" class="qr-container"></div>
                    </div>

                    <!-- Surge订阅 -->
                    <div class="subscription-card">
                        <div class="subscription-title">🌊 Surge订阅</div>
                        <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?surge','qr_surge')">
                            https://${url.hostname}/${mytoken}?surge
                        </a>
                        <div id="qr_surge" class="qr-container"></div>
                    </div>

                    <!-- Loon订阅 -->
                    <div class="subscription-card">
                        <div class="subscription-title">🎈 Loon订阅</div>
                        <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?loon','qr_loon')">
                            https://${url.hostname}/${mytoken}?loon
                        </a>
                        <div id="qr_loon" class="qr-container"></div>
                    </div>
                </div>

                <!-- 访客订阅切换 -->
                <button class="guest-toggle" onclick="toggleGuestSection()">
                    👥 查看访客订阅地址
                </button>

                <!-- 访客订阅区域 -->
                <div id="guest-section" class="guest-section" style="display: none;">
                    <h3 style="margin-bottom: 16px; color: #059669;">👥 访客订阅地址</h3>
                    <p style="margin-bottom: 16px; color: #6b7280;">访客订阅只能使用订阅功能，无法查看配置页面</p>
                    <p style="margin-bottom: 20px;"><strong>访客Token:</strong> <code style="background: rgba(0,0,0,0.1); padding: 4px 8px; border-radius: 4px;">${guest}</code></p>
                    
                    <div class="subscription-grid">
                        <div class="subscription-card">
                            <div class="subscription-title">🔄 访客自适应</div>
                            <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','qr_guest_auto')">
                                https://${url.hostname}/sub?token=${guest}
                            </a>
                            <div id="qr_guest_auto" class="qr-container"></div>
                         </div>

                        <div class="subscription-card">
                            <div class="subscription-title">⚔️ 访客Clash</div>
                            <a href="javascript:void(0)" class="subscription-link" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','qr_guest_clash')">
                                https://${url.hostname}/sub?token=${guest}&clash
                            </a>
                            <div id="qr_guest_clash" class="qr-container"></div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 中区：汇聚订阅编辑 -->
<div class="section fade-in">
    <div class="section-header">
        ✏️ 汇聚订阅编辑器
    </div>
    <div class="section-content">
        <div class="editor-container">
            <textarea class="editor" id="content" placeholder="
请输入订阅链接和节点信息，每行一个...
示例：
vmess://eyJ2IjoiMiIsInBzIjoi...
trojan://password@domain.com:443?...
https://example.com/subscription1
https://example.com/subscription2">${content}</textarea>
            
            <div class="editor-actions">
                <button class="save-btn" onclick="saveContent()">
                    💾 保存配置
                </button>
                <div class="save-status" id="saveStatus">
                    准备就绪
                </div>
            </div>
        </div>
    </div>
</div>

        <!-- 下区：订阅转换配置 -->
        <div class="section fade-in">
            <div class="section-header">
                ⚙️ 订阅转换配置
            </div>
            <div class="section-content">
                <div class="config-grid">
                    <div class="config-item">
                        <div class="config-label">订阅转换后端</div>
                        <div class="config-value">${subProtocol}://${subConverter}</div>
                    </div>
                    <div class="config-item">
                        <div class="config-label">订阅配置文件</div>
                        <div class="config-value">${subConfig}</div>
                    </div>
                    <div class="config-item">
                        <div class="config-label">订阅更新时间</div>
                        <div class="config-value">${SUBUpdateTime} 小时</div>
                    </div>
                    <div class="config-item">
                        <div class="config-label">总流量配额</div>
                        <div class="config-value">${total} TB</div>
                    </div>
                    <div class="config-item">
                        <div class="config-label">过期时间</div>
                        <div class="config-value">${new Date(timestamp).getFullYear()}-${new Date(timestamp).getMonth() + 1}-${new Date(timestamp).getDate()}</div>
                    </div>
                    <div class="config-item">
                        <div class="config-label">文件名称</div>
                        <div class="config-value">${FileName}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 信息区 -->
        <div class="section info-section fade-in">
            <div class="section-header">
                ℹ️ 项目信息
            </div>
            <div class="section-content">
                <div style="text-align: center;">
                    <h3 style="margin-bottom: 16px; color: #e2e8f0;">CF-Workers-SUB</h3>
                    <p style="margin-bottom: 20px; color: #cbd5e1;">基于 Cloudflare Workers 的高性能订阅聚合与转换服务</p>
                    
                    <div class="info-links">
                        <a href="https://t.me/CMLiussss" class="info-link">
                            📢 Telegram 交流群
                        </a>
                        <a href="https://github.com/cmliu/CF-Workers-SUB" class="info-link">
                            🌟 GitHub 项目
                        </a>
                        <a href="#" class="info-link">
                            📖 使用文档
                        </a>
                    </div>

                    <div class="user-agent">
                        <strong>User-Agent:</strong> Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
                    </div>
                </div>
            </div>
        </div>
    </div>
					<script>
					function copyToClipboard(text, qrcode) {
						navigator.clipboard.writeText(text).then(() => {
							alert('已复制到剪贴板');
						}).catch(err => {
							console.error('复制失败:', err);
						});
						const qrcodeDiv = document.getElementById(qrcode);
						qrcodeDiv.innerHTML = '';
						new QRCode(qrcodeDiv, {
							text: text,
							width: 220, // 调整宽度
							height: 220, // 调整高度
							colorDark: "#000000", // 二维码颜色
							colorLight: "#ffffff", // 背景颜色
							correctLevel: QRCode.CorrectLevel.Q, // 设置纠错级别
							scale: 1 // 调整像素颗粒度
						});
					}
						
					if (document.querySelector('.editor')) {
						let timer;
						const textarea = document.getElementById('content');
						const originalContent = textarea.value;
		
						function goBack() {
							const currentUrl = window.location.href;
							const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
							window.location.href = parentUrl;
						}
		
						function replaceFullwidthColon() {
							const text = textarea.value;
							textarea.value = text.replace(/：/g, ':');
						}
						
function saveContent() {
    const button = document.querySelector('.save-btn');
    const textarea = document.getElementById('content');
    const statusElem = document.getElementById('saveStatus');
    
    if (!textarea || !statusElem) {
        console.error('找不到必要的页面元素');
        return;
    }
    
    try {
        // 更新按钮状态
        const updateButtonText = (text) => {
            button.innerHTML = text;
        };
        
        // 更新状态显示
        const updateStatus = (message, isError = false) => {
            statusElem.textContent = message;
            statusElem.className = 'save-status ' + (isError ? 'status-error' : 'status-success');
        };
        
        // 重置按钮状态
        const resetButton = () => {
            button.innerHTML = '💾 保存配置';
            button.disabled = false;
        };
        
        updateButtonText('<div class="loading"></div> 保存中...');
        button.disabled = true;
        
        // 检测iOS设备并处理全角冒号
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (!isIOS) {
            textarea.value = textarea.value.replace(/：/g, ':');
        }
        
        const newContent = textarea.value || '';
        const originalContent = textarea.defaultValue || '';
        
        if (newContent !== originalContent) {
            fetch(window.location.href, {
                method: 'POST',
                body: newContent,
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8'
                },
                cache: 'no-cache'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(\`HTTP error! status: \${response.status}\`);
                }
                return response.text();
            })
            .then(result => {
                const now = new Date().toLocaleString();
                document.title = \`编辑已保存 \${now}\`;
                updateStatus(\`已保存 \${now}\`);
                // 更新textarea的默认值，避免重复保存
                textarea.defaultValue = newContent;
            })
            .catch(error => {
                console.error('Save error:', error);
                updateStatus(\`保存失败: \${error.message}\`, true);
            })
            .finally(() => {
                resetButton();
            });
        } else {
            updateStatus('内容未变化');
            resetButton();
        }
    } catch (error) {
        console.error('保存过程出错:', error);
        resetButton();
        updateStatus(\`错误: \${error.message}\`, true);
    }
}
		
						textarea.addEventListener('blur', saveContent);
						textarea.addEventListener('input', () => {
							clearTimeout(timer);
							timer = setTimeout(saveContent, 5000);
						});
					}

					function toggleNotice() {
						const noticeContent = document.getElementById('noticeContent');
						const noticeToggle = document.getElementById('noticeToggle');
						if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
							noticeContent.style.display = 'block';
							noticeToggle.textContent = '隐藏访客订阅∧';
						} else {
							noticeContent.style.display = 'none';
							noticeToggle.textContent = '查看访客订阅∨';
						}
					}
					function toggleGuestSection() {
    const guestSection = document.getElementById('guest-section');
    const button = event.target;
    if (guestSection.style.display === 'none' || guestSection.style.display === '') {
        guestSection.style.display = 'block';
        button.textContent = '👥 隐藏访客订阅地址';
    } else {
        guestSection.style.display = 'none';
        button.textContent = '👥 查看访客订阅地址';
    }
}
			

					// 页面加载完成后的初始化
					document.addEventListener('DOMContentLoaded', function() {
						// 为所有section添加渐入动画
						const sections = document.querySelectorAll('.section');
						sections.forEach((section, index) => {
							// **添加检查：确保 section 元素存在**
							if (section) {
								setTimeout(() => {
									section.style.opacity = '0';
									section.style.transform = 'translateY(20px)';
									section.style.transition = 'all 0.6s ease-out';

									setTimeout(() => {
										section.style.opacity = '1';
										section.style.transform = 'translateY(0)';
									}, 100);
								}, index * 150);
							} else {
								console.warn('Section element at index ' + index + ' not found for fade-in animation.');
							}
						});

						// 初始化访客订阅区域为隐藏 (确保元素存在)
						const guestSection = document.getElementById('guest-section');
						 if (guestSection) {
							guestSection.style.display = 'none';
						 }

						 // 确保编辑器和保存按钮的事件监听器在 DOM 加载后绑定
						 // 之前的 saveContent 和自动保存逻辑已经包含了获取元素的逻辑
						 // 这里可以移除DOMContentLoaded内部对编辑器的重复获取和事件绑定，
						 // 或者确认之前的绑定逻辑是在DOMContentLoaded外部且能正确执行。
						 // 为了简化和避免潜在冲突，我将假设之前的绑定逻辑（在DOMContentLoaded外部）是正确的。
						 // 如果之前在DOMContentLoaded外部获取元素失败，那么在DOMContentLoaded内部重新获取并绑定可能是必要的。
						 // 考虑到之前的TypeError，将主要绑定逻辑移入DOMContentLoaded可能是更安全的做法。

						 // 将编辑器和保存按钮的事件绑定移入 DOMContentLoaded
						const editorElement = document.getElementById('content'); // 使用正确的编辑器 ID
						const saveButtonElement = document.querySelector('.save-btn'); // 获取保存按钮

						if (editorElement && saveButtonElement) {
							let saveTimeout;

							// 失焦时保存
							editorElement.addEventListener('blur', function() {
								 clearTimeout(saveTimeout); // 清除可能的自动保存定时器
								 // 触发保存逻辑
								 if (!saveButtonElement.disabled) { // 避免重复保存
									 saveContent(); // 调用 saveContent，它会自己获取 button
								 }
							});

							// 输入时延迟保存
							editorElement.addEventListener('input', function() {
								clearTimeout(saveTimeout);
								const statusElement = document.getElementById('saveStatus'); // 正确的状态显示 ID
								if (statusElement) {
									 statusElement.textContent = '⏳ 自动保存中...';
									 statusElement.className = 'save-status'; // 重置类名
								}

								saveTimeout = setTimeout(() => {
									// 触发保存逻辑
									if (!saveButtonElement.disabled) { // 避免在保存过程中触发自动保存
										 saveContent(); // 调用 saveContent
									}
								}, 2000); // 2秒无输入后触发
							});

							// 设置快捷键保存 Ctrl+S
							editorElement.addEventListener('keydown', (e) => {
								if ((e.ctrlKey || e.metaKey) && e.key === 's') {
									e.preventDefault();
									saveContent(); // 调用 saveContent
								}
							});

							// 存储初始内容到 defaultValue，以便后续判断内容是否变化
							editorElement.defaultValue = editorElement.value;

						} else {
							 console.error("DOMConentLoaded: 未找到编辑器或保存按钮，自动保存和blur事件未绑定.");
						}
					});
					</script>
				</body>
			</html>
		`;

		return new Response(html, {
			headers: { "Content-Type": "text/html;charset=utf-8" }
		});
	} catch (error) {
		console.error('处理请求时发生错误:', error);
		return new Response("服务器错误: " + error.message, {
			status: 500,
			headers: { "Content-Type": "text/plain;charset=utf-8" }
		});
	}
}
