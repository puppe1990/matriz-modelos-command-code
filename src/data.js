/* ============================================================
   DADOS — catálogo Command Code (referência: 14/set/2026)
   inp/out/cr = USD por 1M tokens (input / output / cache read)
   cw    = cache write (null quando o provider não cobra)
   base  = preço cheio antes do deal
   peak  = [input, output] em horário de pico (DeepSeek)
   iq    = Intelligence publicado pela tabela do plano
   aa    = Intelligence do catálogo (Artificial Analysis v4.3)
   tps   = tokens/s · min = plano mínimo
   cred  = teto mensal de crédito DESTE modelo no plano GOAT (USD)
   req   = requisições/mês publicadas por plano (null = não serve / não publicado)
   ============================================================ */
export const MODELS = [
  // ---------- OPEN SOURCE ----------
  {id:"deepseek/deepseek-v4-pro",n:"DeepSeek V4 Pro",v:"DeepSeek",ctx:"1M",inp:0.66,out:1.98,cr:0.022,cw:null,iq:42.1,tps:62,min:"go",cred:20,tags:["reasoning"],peak:[1.32,3.96],req:{goat:9880,pro:14800,max:74100}},
  {id:"deepseek/deepseek-v4-flash",n:"DeepSeek V4 Flash",v:"DeepSeek",ctx:"1M",inp:0.15,out:0.60,cr:0.003,cw:null,iq:41.0,tps:118,min:"go",cred:60,tags:["reasoning"],peak:[0.30,1.20],req:{goat:154000,pro:179000,max:385000}},
  {id:"deepseek/deepseek-v4-flash-vision-exp",n:"DeepSeek V4 Flash Vision",v:"DeepSeek",ctx:"1M",inp:0.15,out:0.60,cr:0.003,cw:null,iq:40.7,tps:120,min:"go",cred:20,tags:["vision","reasoning"],peak:[0.30,1.20],req:{goat:51300,pro:69800,max:256000}},
  {id:"deepseek/deepseek-v4-flash-fast",n:"DeepSeek V4 Flash Fast",v:"DeepSeek",ctx:"1M",inp:0.28,out:0.56,cr:0.07,cw:null,iq:null,tps:null,min:"go",cred:20,tags:["reasoning"],req:{goat:5210,pro:7820,max:39100}},
  {id:"deepseek/deepseek-v4.1-flash",n:"DeepSeek V4.1 Flash",v:"DeepSeek",ctx:"1M",inp:0.15,out:0.60,cr:0.003,cw:null,iq:null,aa:39.5,tps:null,min:"go",cred:60,tags:["vision","reasoning","deal"],peak:[0.30,1.20],req:{goat:154000,pro:179000,max:385000}},
  {id:"moonshotai/Kimi-K3",n:"Kimi K3",v:"Moonshot",ctx:"1M",inp:3.00,out:15.00,cr:0.30,cw:null,iq:50.2,tps:42,min:"go",cred:20,tags:["reasoning"],req:{goat:980,pro:1470,max:7350}},
  {id:"moonshotai/Kimi-K2.7-Code",n:"Kimi K2.7 Code",v:"Moonshot",ctx:"256K",inp:0.95,out:4.00,cr:0.19,cw:null,iq:32.7,tps:66,min:"go",cred:60,tags:["vision"],req:{goat:5420,pro:6330,max:13600}},
  {id:"moonshotai/Kimi-K2.7-Code-Highspeed",n:"Kimi K2.7 Code HighSpeed",v:"Moonshot",ctx:"262K",inp:1.90,out:8.00,cr:0.38,cw:null,iq:null,tps:null,min:"go",cred:20,tags:["vision"],req:{goat:904,pro:1360,max:6780}},
  {id:"moonshotai/Kimi-K2.6",n:"Kimi K2.6",v:"Moonshot",ctx:"256K",inp:0.95,out:4.00,cr:0.16,cw:null,iq:35.8,tps:null,min:"go",cred:20,tags:["vision"],req:{goat:null,pro:null,max:15700}},
  {id:"moonshotai/Kimi-K2.5",n:"Kimi K2.5",v:"Moonshot",ctx:"256K",inp:0.60,out:3.00,cr:0.10,cw:null,iq:27.6,tps:null,min:"go",cred:20,tags:["vision"],req:{goat:null,pro:null,max:24700}},
  {id:"z-ai/glm-5.3-flash",n:"GLM-5.3 Flash",v:"Z.ai",ctx:"1M",inp:0.15,out:0.50,cr:0.03,cw:null,iq:46.2,tps:59,min:"go",cred:40,tags:["reasoning"],req:{goat:23600,pro:29500,max:88500}},
  {id:"zai-org/GLM-5.3",n:"GLM-5.3",v:"Z.ai",ctx:"1M",inp:1.40,out:4.40,cr:0.26,cw:null,iq:48.6,tps:75,min:"go",cred:20,tags:["reasoning"],req:{goat:1350,pro:2030,max:10100}},
  {id:"zai-org/GLM-5.2",n:"GLM-5.2",v:"Z.ai",ctx:"1M",inp:1.40,out:4.40,cr:0.26,cw:null,iq:42.1,tps:68,min:"go",cred:70,tags:["reasoning"],req:{goat:4740,pro:5410,max:10100}},
  {id:"zai-org/GLM-5.2-Fast",n:"GLM-5.2 Fast",v:"Z.ai",ctx:"1M",inp:3.00,out:10.25,cr:0.50,cw:null,iq:null,tps:null,min:"go",cred:20,tags:[],req:{goat:691,pro:1040,max:5180}},
  {id:"zai-org/GLM-5.1",n:"GLM-5.1",v:"Z.ai",ctx:"200K",inp:1.40,out:4.40,cr:0.26,cw:null,iq:31.9,tps:null,min:"go",cred:20,tags:[],req:{goat:null,pro:null,max:10100}},
  {id:"zai-org/GLM-5",n:"GLM-5",v:"Z.ai",ctx:"200K",inp:1.00,out:3.20,cr:0.20,cw:null,iq:32.4,tps:null,min:"go",cred:20,tags:[],req:{goat:null,pro:null,max:13300}},
  {id:"MiniMaxAI/MiniMax-M3",n:"MiniMax M3",v:"MiniMax",ctx:"1M",inp:0.30,out:1.20,cr:0.06,cw:null,iq:35.7,tps:96,min:"go",cred:47,tags:["vision","reasoning","deal"],base:[0.60,2.40,0.12],req:{goat:13900,pro:16800,max:44200}},
  {id:"MiniMaxAI/MiniMax-M2.7",n:"MiniMax M2.7",v:"MiniMax",ctx:"200K",inp:0.30,out:1.20,cr:0.06,cw:null,iq:30.1,tps:null,min:"go",cred:20,tags:[],req:{goat:null,pro:null,max:44200}},
  {id:"MiniMaxAI/MiniMax-M2.5",n:"MiniMax M2.5",v:"MiniMax",ctx:"200K",inp:0.30,out:1.20,cr:0.03,cw:null,iq:26.8,tps:null,min:"go",cred:20,tags:[],req:{goat:null,pro:null,max:79400}},
  {id:"xiaomi/mimo-v2.5-pro",n:"MiMo V2.5 Pro",v:"Xiaomi",ctx:"1M",inp:0.435,out:0.87,cr:0.0036,cw:null,iq:32.6,tps:41,min:"go",cred:20,tags:["deal"],base:[2.00,6.00,0.40],req:{goat:28500,pro:42700,max:214000}},
  {id:"xiaomi/mimo-v2.5",n:"MiMo V2.5",v:"Xiaomi",ctx:"1M",inp:0.14,out:0.28,cr:0.0028,cw:null,iq:28.2,tps:61,min:"go",cred:30,tags:["deal"],base:[0.80,4.00,0.16],req:{goat:97400,pro:130000,max:487000}},
  {id:"Qwen/Qwen3.8-Max-0902",n:"Qwen 3.8 Max 0902",v:"Alibaba",ctx:"1M",inp:2.00,out:6.00,cr:0.25,cw:null,iq:null,tps:null,min:"go",cred:20,tags:["reasoning"],req:{goat:1310,pro:1960,max:9800}},
  {id:"Qwen/Qwen3.8-Max",n:"Qwen 3.8 Max",v:"Alibaba",ctx:"1M",inp:2.00,out:6.00,cr:0.25,cw:2.50,iq:46.9,tps:38,min:"go",cred:20,tags:["reasoning"],req:{goat:1310,pro:1960,max:9800}},
  {id:"Qwen/Qwen3.8-27B",n:"Qwen 3.8 27B",v:"Alibaba",ctx:"262K",inp:0.40,out:3.00,cr:0.04,cw:null,iq:41.4,tps:46,min:"go",cred:70,tags:["vision","reasoning"],req:{goat:24000,pro:27400,max:51400}},
  {id:"Qwen/Qwen3.8-Flash",n:"Qwen 3.8 Flash",v:"Alibaba",ctx:"1M",inp:0.16,out:0.47,cr:0.016,cw:null,iq:null,tps:null,min:"go",cred:20,tags:["reasoning"],req:{goat:19600,pro:29400,max:147000}},
  {id:"Qwen/Qwen3.7-Max",n:"Qwen 3.7 Max",v:"Alibaba",ctx:"1M",inp:2.50,out:7.50,cr:0.50,cw:3.13,iq:36.6,tps:null,min:"go",cred:33,tags:[],req:{goat:1160,pro:1510,max:5260}},
  {id:"Qwen/Qwen3.7-Plus",n:"Qwen 3.7 Plus",v:"Alibaba",ctx:"1M",inp:0.40,out:1.60,cr:0.08,cw:0.50,iq:31.9,tps:55,min:"go",cred:33,tags:[],req:{goat:7110,pro:9270,max:32300}},
  {id:"Qwen/Qwen3.7-Flash",n:"Qwen 3.7 Flash",v:"Alibaba",ctx:"1M",inp:0.03,out:0.13,cr:0.006,cw:0.038,iq:null,tps:null,min:"go",cred:20,tags:["reasoning"],req:{goat:null,pro:null,max:429000}},
  {id:"Qwen/Qwen3.6-Max-Preview",n:"Qwen 3.6 Max Preview",v:"Alibaba",ctx:"200K",inp:1.30,out:7.80,cr:0.26,cw:1.63,iq:32.9,tps:null,min:"go",cred:20,tags:[],req:{goat:null,pro:null,max:9620}},
  {id:"Qwen/Qwen3.6-Plus",n:"Qwen 3.6 Plus",v:"Alibaba",ctx:"200K",inp:0.50,out:3.00,cr:0.10,cw:null,iq:31.5,tps:null,min:"go",cred:33,tags:[],req:{goat:5500,pro:7170,max:25000}},
  {id:"meituan/LongCat-2.0:free",n:"LongCat 2.0",v:"Meituan",ctx:"1M",inp:0,out:0,cr:0,cw:null,iq:25.8,tps:49,min:"go",cred:0,tags:["free"],req:{goat:0,pro:0,max:0}},
  {id:"stepfun/Step-3.7-Flash",n:"Step 3.7 Flash",v:"StepFun",ctx:"256K",inp:0.20,out:1.15,cr:0.04,cw:null,iq:22.9,tps:87,min:"go",cred:20,tags:["vision","reasoning"],req:{goat:8370,pro:12600,max:62800}},
  {id:"stepfun/Step-3.5-Flash",n:"Step 3.5 Flash",v:"StepFun",ctx:"1M",inp:0.10,out:0.30,cr:0.02,cw:null,iq:19.5,tps:null,min:"go",cred:20,tags:[],req:{goat:17500,pro:26300,max:132000}},
  {id:"tencent/hy3-paid",n:"Tencent Hy3",v:"Tencent",ctx:"262K",inp:0.14,out:0.58,cr:0.035,cw:null,iq:32.4,tps:99,min:"go",cred:70,tags:["reasoning"],req:{goat:35400,pro:40400,max:75800}},
  {id:"tencent/hy4-preview",n:"Tencent Hy4 Preview",v:"Tencent",ctx:"1M",inp:0.834,out:2.501,cr:0.042,cw:null,iq:null,tps:null,min:"go",cred:20,tags:["reasoning"],req:{goat:6120,pro:9180,max:45900}},
  {id:"nvidia/nemotron-3-ultra-550b-a55b",n:"Nemotron 3 Ultra",v:"NVIDIA",ctx:"1M",inp:0.60,out:2.40,cr:0.12,cw:null,iq:29.3,tps:158,min:"go",cred:20,tags:["reasoning"],req:{goat:2870,pro:4310,max:21600}},
  {id:"thinkingmachines/inkling",n:"Inkling",v:"Thinking Machines",ctx:"256K",inp:1.00,out:4.05,cr:0.17,cw:null,iq:32.2,tps:65,min:"go",cred:20,tags:["vision","reasoning"],req:{goat:1980,pro:2970,max:14800}},
  {id:"thinkingmachines/inkling-small",n:"Inkling Small",v:"Thinking Machines",ctx:"1M",inp:0.50,out:1.20,cr:0.10,cw:null,iq:32.2,tps:133,min:"go",cred:20,tags:["reasoning"],req:{goat:3550,pro:5320,max:26600}},
  {id:"poolside/laguna-s-2.1-free",n:"Laguna S 2.1",v:"Poolside",ctx:"256K",inp:0,out:0,cr:0,cw:null,iq:null,tps:null,min:"go",cred:0,tags:["free"],req:{goat:0,pro:0,max:0}},
  {id:"inclusionai/ling-3.0-flash-sante:free",n:"Ling 3.0 Flash Sante",v:"InclusionAI",ctx:"262K",inp:0,out:0,cr:0,cw:null,iq:null,tps:null,min:"go",cred:0,tags:["free"],req:{goat:0,pro:0,max:0}},

  // ---------- PREMIUM ----------
  {id:"claude-sonnet-5",n:"Claude Sonnet 5",v:"Anthropic",ctx:"1M",inp:2.00,out:10.00,cr:0.20,cw:2.50,iq:45.1,tps:80,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:1490,max:7460}},
  {id:"claude-sonnet-4-6",n:"Claude Sonnet 4.6",v:"Anthropic",ctx:"1M",inp:3.00,out:15.00,cr:0.30,cw:3.75,iq:38.5,tps:null,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:995,max:4980}},
  {id:"claude-haiku-4-5-20251001",n:"Claude Haiku 4.5",v:"Anthropic",ctx:"200K",inp:1.00,out:5.00,cr:0.10,cw:1.25,iq:17.4,tps:91,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:2990,max:14900}},
  {id:"claude-opus-5",n:"Claude Opus 5",v:"Anthropic",ctx:"1M",inp:5.00,out:25.00,cr:0.50,cw:6.25,iq:null,aa:50.7,tps:null,min:"max",cred:null,tags:["reasoning"],req:{goat:null,pro:null,max:2990}},
  {id:"claude-opus-4-8",n:"Claude Opus 4.8",v:"Anthropic",ctx:"1M",inp:5.00,out:25.00,cr:0.50,cw:6.25,iq:null,aa:42.0,tps:null,min:"max",cred:null,tags:["reasoning"],req:{goat:null,pro:null,max:2990}},
  {id:"claude-opus-4-7",n:"Claude Opus 4.7",v:"Anthropic",ctx:"1M",inp:5.00,out:25.00,cr:0.50,cw:6.25,iq:null,aa:40.7,tps:null,min:"max",cred:null,tags:["reasoning"],req:{goat:null,pro:null,max:2990}},
  {id:"claude-fable-5-1",n:"Claude Fable 5.1",v:"Anthropic",ctx:"1M",inp:10.00,out:50.00,cr:0.25,cw:12.50,iq:null,aa:53.4,tps:null,min:"max",cred:null,tags:["reasoning"],req:{goat:null,pro:null,max:3390}},
  {id:"claude-fable-5",n:"Claude Fable 5",v:"Anthropic",ctx:"1M",inp:10.00,out:50.00,cr:1.00,cw:12.50,iq:null,aa:49.7,tps:null,min:"max",cred:null,tags:["reasoning"],req:{goat:null,pro:null,max:1490}},
  {id:"gpt-6-astra",n:"GPT-6 Astra",v:"OpenAI",ctx:"1.05M",inp:10.00,out:50.00,cr:1.00,cw:12.50,iq:null,aa:52.8,tps:null,min:"max",cred:null,tags:["reasoning"],req:{goat:null,pro:null,max:1520}},
  {id:"gpt-5.6-sol",n:"GPT-5.6 Sol",v:"OpenAI",ctx:"1.1M",inp:5.00,out:30.00,cr:0.50,cw:6.25,iq:51.3,tps:73,min:"goat",cred:70,tags:["reasoning"],req:{goat:2070,pro:2370,max:4440}},
  {id:"gpt-5.6-terra",n:"GPT-5.6 Terra",v:"OpenAI",ctx:"1.05M",inp:2.00,out:12.00,cr:0.20,cw:2.50,iq:46.8,tps:121,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:1480,max:7400}},
  {id:"gpt-5.6-luna",n:"GPT-5.6 Luna",v:"OpenAI",ctx:"1.1M",inp:0.20,out:1.20,cr:0.02,cw:0.25,iq:43.4,tps:117,min:"go",cred:20,tags:["reasoning"],req:{goat:14800,pro:22200,max:111000}},
  {id:"gpt-5.5",n:"GPT-5.5",v:"OpenAI",ctx:"400K",inp:5.00,out:30.00,cr:0.50,cw:null,iq:45.6,tps:null,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:592,max:2960}},
  {id:"gpt-5.4",n:"GPT-5.4",v:"OpenAI",ctx:"400K",inp:2.50,out:15.00,cr:0.25,cw:null,iq:42.8,tps:null,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:1180,max:5920}},
  {id:"gpt-5.4-mini",n:"GPT-5.4 Mini",v:"OpenAI",ctx:"400K",inp:0.75,out:4.50,cr:0.075,cw:null,iq:31.9,tps:null,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:3940,max:19700}},
  {id:"gpt-5.3-codex",n:"GPT-5.3 Codex",v:"OpenAI",ctx:"400K",inp:2.00,out:8.00,cr:0.50,cw:null,iq:36.9,tps:143,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:717,max:3590}},
  {id:"google/gemini-3.8-flash",n:"Gemini 3.8 Flash",v:"Google",ctx:"1M",inp:1.50,out:7.50,cr:0.15,cw:null,iq:47.1,tps:356,min:"goat",cred:40,tags:["reasoning"],req:{goat:3920,pro:4900,max:14700}},
  {id:"google/gemini-3.7-flash",n:"Gemini 3.7 Flash",v:"Google",ctx:"1M",inp:1.50,out:7.50,cr:0.15,cw:0.08334,iq:45.2,tps:325,min:"goat",cred:40,tags:["reasoning"],req:{goat:3920,pro:4900,max:14700}},
  {id:"google/gemini-3.6-flash",n:"Gemini 3.6 Flash",v:"Google",ctx:"1M",inp:1.50,out:7.50,cr:0.15,cw:null,iq:40.3,tps:189,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:1960,max:9800}},
  {id:"google/gemini-3.5-flash",n:"Gemini 3.5 Flash",v:"Google",ctx:"1M",inp:1.50,out:9.00,cr:0.15,cw:null,iq:39.7,tps:null,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:1900,max:9520}},
  {id:"google/gemini-3.5-flash-lite",n:"Gemini 3.5 Flash Lite",v:"Google",ctx:"1M",inp:0.30,out:2.50,cr:0.03,cw:null,iq:27.6,tps:339,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:8930,max:44600}},
  {id:"google/gemini-3.1-flash-lite",n:"Gemini 3.1 Flash Lite",v:"Google",ctx:"1M",inp:0.25,out:1.50,cr:0.03,cw:null,iq:19.3,tps:null,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:10000,max:50000}},
  {id:"sakana/fugu-ultra",n:"Fugu Ultra",v:"Sakana",ctx:"1M",inp:5.00,out:30.00,cr:0.50,cw:null,iq:null,tps:null,min:"max",cred:null,tags:["reasoning"],req:{goat:null,pro:null,max:2860}},
  {id:"meta/muse-spark-1.1",n:"Muse Spark 1.1",v:"Meta",ctx:"1.05M",inp:1.25,out:4.25,cr:0.15,cw:null,iq:41.2,tps:null,min:"pro",cred:null,tags:["reasoning"],req:{goat:null,pro:2140,max:10700}},
  {id:"meta/muse-spark-1.2",n:"Muse Spark 1.2",v:"Meta",ctx:"1M",inp:1.25,out:4.25,cr:0.15,cw:null,iq:46.8,tps:262,min:"goat",cred:20,tags:["reasoning"],req:{goat:2140,pro:3210,max:16000}},
  {id:"meta/muse-spark-1.2-contributor",n:"Muse Spark 1.2 Contributor",v:"Meta",ctx:"1M",inp:0.10,out:0.20,cr:0.002,cw:null,iq:46.8,tps:262,min:"go",cred:20,tags:["reasoning","deal"],req:{goat:90900,pro:136000,max:682000}},
  {id:"meta/muse-spark-1.3",n:"Muse Spark 1.3",v:"Meta",ctx:"1M",inp:1.25,out:4.25,cr:0.15,cw:null,iq:53.0,tps:221,min:"goat",cred:20,tags:["reasoning"],req:{goat:2140,pro:3210,max:16000}},
  {id:"meta/muse-spark-1.3-contributor",n:"Muse Spark 1.3 Contributor",v:"Meta",ctx:"1M",inp:0.10,out:0.20,cr:0.002,cw:null,iq:53.0,tps:221,min:"go",cred:20,tags:["reasoning","deal"],req:{goat:90900,pro:136000,max:682000}},
  {id:"xai/grok-4.5",n:"Grok 4.5",v:"xAI",ctx:"500K",inp:2.00,out:6.00,cr:0.50,cw:null,iq:45.5,tps:53,min:"go",cred:20,tags:["reasoning"],req:{goat:719,pro:1080,max:5400}},
  {id:"xai/grok-4.6",n:"Grok 4.6",v:"xAI",ctx:"500K",inp:2.00,out:6.00,cr:0.50,cw:null,iq:50.6,tps:57,min:"goat",cred:20,tags:["reasoning"],req:{goat:719,pro:1080,max:5400}}
];
