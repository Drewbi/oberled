// import net
import spi
import gpio

count := 0
buffer_on := ByteArray 32 --filler=255
buffer_off := ByteArray 32 --filler=0

// import .io
// import .server
// import .mode

main:
//   init_io
//   init_modes
//   init_server

//   while true:
//     current-mode.run
//     mode_changed = false
//     sleep --ms=33

  latch := gpio.Pin 12
  latch.configure --output

  enable := gpio.Pin 26
  enable.configure --output

  bus := spi.Bus
    --mosi=gpio.Pin 27
    --clock=gpio.Pin 14

  device := bus.device
    --frequency=10_000_000

  enable.set 0

  while true:
    1.repeat:
      device.transfer buffer_on
    
      latch.set 1
      latch.set 0
    
    8.repeat:
      device.transfer buffer_off
    
      latch.set 1
      latch.set 0

