class SoundManagerClass {
  private audioContext: AudioContext | null = null
  private sounds: { [key: string]: AudioBuffer } = {}
  private initialized = false

  async initialize() {
    if (this.initialized) return

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      await this.loadSounds()
      this.initialized = true
    } catch (error) {
      console.warn('Sound initialization failed:', error)
    }
  }

  private async loadSounds() {
    const soundList = {
      click: () => this.generateTone(800, 0.1, 'sine'),
      startup: () => this.generateTone(440, 0.3, 'sine'),
      success: () => this.generateChord([440, 554.37, 659.25], 0.4),
      error: () => this.generateTone(200, 0.5, 'sawtooth'),
      notification: () => this.generateChord([523.25, 659.25, 783.99], 0.3),
      typing: () => this.generateTone(600, 0.05, 'square')
    }

    for (const [name, generator] of Object.entries(soundList)) {
      try {
        this.sounds[name] = await generator()
      } catch (error) {
        console.warn(`Failed to generate sound: ${name}`, error)
      }
    }
  }

  private async generateTone(frequency: number, duration: number, type: OscillatorType): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const sampleRate = this.audioContext.sampleRate
    const length = Math.floor(sampleRate * duration)
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let sample = 0

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * t))
          break
        case 'sawtooth':
          sample = 2 * (frequency * t - Math.floor(frequency * t + 0.5))
          break
        case 'triangle':
          sample = 2 * Math.abs(2 * (frequency * t - Math.floor(frequency * t + 0.5))) - 1
          break
      }

      // Apply fade in/out to avoid clicks
      const fadeTime = 0.01
      const fadeLength = Math.floor(sampleRate * fadeTime)
      if (i < fadeLength) {
        sample *= i / fadeLength
      } else if (i > length - fadeLength) {
        sample *= (length - i) / fadeLength
      }

      data[i] = sample * 0.3 // Volume control
    }

    return buffer
  }

  private async generateChord(frequencies: number[], duration: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('Audio context not initialized')

    const sampleRate = this.audioContext.sampleRate
    const length = Math.floor(sampleRate * duration)
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let sample = 0

      for (const freq of frequencies) {
        sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length
      }

      // Apply fade in/out
      const fadeTime = 0.01
      const fadeLength = Math.floor(sampleRate * fadeTime)
      if (i < fadeLength) {
        sample *= i / fadeLength
      } else if (i > length - fadeLength) {
        sample *= (length - i) / fadeLength
      }

      data[i] = sample * 0.2
    }

    return buffer
  }

  playSound(name: string) {
    if (!this.initialized || !this.audioContext || !this.sounds[name]) {
      return
    }

    try {
      const source = this.audioContext.createBufferSource()
      source.buffer = this.sounds[name]
      source.connect(this.audioContext.destination)
      source.start()
    } catch (error) {
      console.warn(`Failed to play sound: ${name}`, error)
    }
  }

  setVolume(_volume: number) {
    // This could be implemented with a gain node for global volume control
    console.log('Volume control not implemented yet')
  }

  destroy() {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.sounds = {}
    this.initialized = false
  }
}

export const SoundManager = new SoundManagerClass()