colors = [
    [239,247,7],
    [52,219,2],
    [35,35,237],
    [209,29,29],
    [199,54,247],
    [247,159,7],
    [29,242,242],
    [252,40,171],
    [255,255,255],
    [136,136,136]
    ]

TouchManager = 
    data : 
        state : {}
        pos: []
        availableColorIndexes: [0...colors.length]
        bgColor: [7,30,3]
        bgColor: [0,0,0]
        evtCountMax: 3
        width: 50
        sounds: 
            ting: new Howl src: ['sound/237105__sqeeeek__sqeeeek-bell-ting2.wav']
            tong: new Howl src: ['sound/237106__sqeeeek__sqeeeek-bell-ting1.wav']
            dzang: new Howl src: ['sound/170237__luttoaudio__glass-ting.wav']
            blong: new Howl src: ['sound/80427__phoenixdk__ploing.wav']
        
    
    clean: () =>
            for p in TouchManager.data.pos
                TouchManager.removeCircle(p.x, p.y)
            p = TouchManager.data.winnerP
            if p != undefined
                TouchManager.removeCircle(p.x, p.y) 
            
            TouchManager.data.winnerP = undefined
            TouchManager.data.pos = []
            TouchManager.data.availableColorIndexes = [0...colors.length]
        
    cleanIfEnded: () => 
        if TouchManager.data.winnerP != undefined
            TouchManager.clean()

    stop: () =>
        TouchManager.data.winnerP = TouchManager.data.pos.splice(Math.random()*TouchManager.data.pos.length, 1)[0]
        for p in TouchManager.data.pos
            TouchManager.addBackCircle(p.x, p.y)
        TouchManager.data.sounds.blong.play()
        TouchManager.data.state.ref = undefined
        TouchManager.data.state.lastChange = undefined
        TouchManager.data.state.evtCount = undefined
        return

    react: (changed) =>
        if TouchManager.data.winnerP != undefined
            return
        if TouchManager.data.pos.length > 0
            if TouchManager.data.state.ref == undefined
                TouchManager.data.state.ref = new Date().getTime()
                TouchManager.data.state.lastChange = new Date().getTime()
                TouchManager.data.state.evtCount = 0

            if changed
                TouchManager.data.state.lastChange = new Date().getTime()
                TouchManager.data.state.evtCount = 0

            delta = Math.floor(new Date().getTime()-TouchManager.data.state.lastChange)
               
            if delta>1000*TouchManager.data.evtCountMax
                TouchManager.stop()
            else if delta>1000*TouchManager.data.state.evtCount
                TouchManager.data.sounds.tong.play()
                TouchManager.data.state.evtCount = TouchManager.data.state.evtCount+1
            nextPossibleEvent = TouchManager.data.state.lastChange+1000*(TouchManager.data.state.evtCount)
            delay = nextPossibleEvent-new Date().getTime()
            setTimeout(TouchManager.react, delay)
        else
            TouchManager.data.state.ref = undefined
            TouchManager.data.state.lastChange = undefined
            TouchManager.data.state.evtCount = undefined
        return
        
    getColor: (color, a) =>
        r = color[0];
        g = color[1];
        b = color[2];
        if a == undefined
          a = 1
        return 'rgba('+r+','+g+','+b+','+a+')'
    
    getBgColor: (a) =>
        TouchManager.getColor(TouchManager.data.bgColor, a)
        
    getColorFromIndex: (colorIndex, a) =>
        color = colors[colorIndex%(colors.length)]
        TouchManager.getColor(color, a)

    addCircle: (x,y,colorIndex) =>
        ctx = TouchManager.data.ctx
        width = TouchManager.data.width
        dwidth = 2*width
        for dx in [0..dwidth]
            for dy in [0..dwidth]
                dd=(dx-width)*(dx-width)+(dy-width)*(dy-width)
                if dd<width*width
                    d = Math.sqrt((dd)/(width*width))
                    f = 1-(Math.pow(1-Math.sqrt(1-d),3))
                    ctx.fillStyle = TouchManager.getColorFromIndex(colorIndex, f)
                    ctx.fillRect(x+dx-width, y+dy-width, 1, 1)
        return
        
    addBackCircle: (x,y) =>
        ctx = TouchManager.data.ctx
        width = TouchManager.data.width*(2/3)
        dwidth = 2*width
        for dx in [0..dwidth]
            for dy in [0..dwidth]
                dd=(dx-width)*(dx-width)+(dy-width)*(dy-width)
                if dd<width*width
                    d = Math.sqrt((dd)/(width*width))
                    f = 1-(Math.pow(1-Math.sqrt(1-d),4))
                    ctx.fillStyle = TouchManager.getBgColor(f)
                    ctx.fillRect(x+dx-width, y+dy-width, 1, 1)
        return
    
    removeCircle: (x,y) =>
        bgColor = TouchManager.getBgColor()
        ctx = TouchManager.data.ctx
        width = TouchManager.data.width
        dwidth = 2*width
        for dx in [0..dwidth]
            for dy in [0..dwidth]
                dd=(dx-width)*(dx-width)+(dy-width)*(dy-width)
                if dd<width*width
                    ctx.fillStyle = bgColor
                    ctx.fillRect(x+dx-width, y+dy-width, 1, 1)
        return
                    
    toogleOn: (x,y) =>
        pindex = 0
        TouchManager.cleanIfEnded()
        for p in TouchManager.data.pos
            d = (p.x-x)*(p.x-x)+(p.y-y)*(p.y-y)
            if d < 50*50
                TouchManager.removeCircle(p.x, p.y)
                TouchManager.data.pos.splice(pindex,1)
                TouchManager.data.availableColorIndexes.push(p.colorIndex)
                TouchManager.react(true)
                return 0
            if d < 100*100
                return 0
            pindex += 1
        if TouchManager.data.availableColorIndexes.length>0
            nextColorIndex = TouchManager.data.availableColorIndexes.splice(Math.random()*TouchManager.data.availableColorIndexes.length,1)[0]
            p = {x:x,y:y,colorIndex:nextColorIndex}
            TouchManager.data.pos.push(p)
            TouchManager.addCircle(p.x, p.y, p.colorIndex)
            # TouchManager.addBackCircle(p.x, p.y)

            TouchManager.data.sounds.dzang.play()
            TouchManager.react(true)
        return
        
    onClick: (e) => 
        TouchManager.toogleOn(e.offsetX, e.offsetY)
        
    init:  () => 
        body = document.body
    
        workspace = document.getElementById('workspace')
        canvas = document.createElement("canvas")
        workspace.appendChild canvas
    
        canvas.width = workspace.clientWidth
        canvas.height = workspace.clientHeight
        ctx = canvas.getContext("2d")
        ctx.fillStyle = TouchManager.getBgColor()
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        TouchManager.data.canvas = canvas
        TouchManager.data.ctx = ctx
        canvas.addEventListener("click", TouchManager.onClick, false);
        window.addEventListener("resize", TouchManager.clean, false);
        window.TouchManager = TouchManager
    
        return


  
TouchManager.init()
